import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Option "mo:core/Option";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  type ApprovalStatus = { #pending; #approved; #rejected };

  type BlogPost = {
    title : Text;
    content : Text;
    author : Text;
    publishedAt : Time.Time;
    coverImageId : ?Text;
    tags : [Text];
    id : Text;
    status : ApprovalStatus;
  };

  let blogPosts = Map.empty<Text, BlogPost>();

  type BlogPostMetadata = {
    title : Text;
    author : Text;
    publishedAt : Time.Time;
    id : Text;
  };

  module BlogPost {
    public func compareByPublishedAt(a : BlogPost, b : BlogPost) : Order.Order {
      switch (Int.compare(b.publishedAt, a.publishedAt)) {
        case (#equal) { Text.compare(a.id, b.id) };
        case (order) { order };
      };
    };
  };

  type Subscription = {
    email : Text;
    subscribedAt : Time.Time;
    id : Text;
  };

  let subscriptions = Map.empty<Text, Subscription>();

  type SiteConfiguration = {
    address : Text;
    phone : Text;
    email : Text;
    socialMedia : {
      facebook : Text;
      twitter : Text;
      instagram : Text;
      linkedin : Text;
      youtube : Text;
      whatsapp : Text;
    };
  };

  var siteConfig : SiteConfiguration = {
    address = "";
    phone = "";
    email = "";
    socialMedia = {
      facebook = "";
      twitter = "";
      instagram = "";
      linkedin = "";
      youtube = "";
      whatsapp = "";
    };
  };

  // Video Post Type
  type VideoPost = {
    id : Text;
    title : Text;
    description : Text;
    videoUrl : Text;
    thumbnailUrl : ?Text;
    uploadedAt : Time.Time;
  };

  type VideoInput = {
    title : Text;
    description : Text;
    videoUrl : Text;
    thumbnailUrl : ?Text;
  };

  let videoPosts = Map.empty<Text, VideoPost>();

  public type UserProfile = { name : Text };

  let userProfiles = Map.empty<Principal, UserProfile>();

  include MixinStorage();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Blog Post Functions - Public queries only return approved posts
  public query func getAllBlogPostMetadata() : async [BlogPostMetadata] {
    blogPosts.values().toArray().filter(func(blogPost) { switch (blogPost.status) { case (#approved) { true }; case (_) { false } } }).map(
      func(blogPost) {
        {
          title = blogPost.title;
          author = blogPost.author;
          publishedAt = blogPost.publishedAt;
          id = blogPost.id;
        };
      }
    );
  };

  public query func getBlogPostById(id : Text) : async BlogPost {
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?blogPost) {
        switch (blogPost.status) { case (#approved) { blogPost }; case (_) { Runtime.trap("Blog post not available") } };
      };
    };
  };

  public type BlogPostInput = {
    title : Text;
    content : Text;
    author : Text;
    coverImageId : ?Text;
    tags : [Text];
  };

  // No authentication required for blogging functions (frontend password gate handles security)
  public shared ({ caller }) func createBlogPost(input : BlogPostInput) : async Text {
    let id = input.title.concat(" ").concat(input.author).concat(Time.now().toText());
    let newPost = {
      title = input.title;
      content = input.content;
      author = input.author;
      publishedAt = Time.now();
      coverImageId = input.coverImageId;
      tags = input.tags;
      id;
      status = #pending;
    };

    blogPosts.add(id, newPost);
    id;
  };

  public shared ({ caller }) func createAndPublishBlogPost(input : BlogPostInput) : async Text {
    let id = input.title.concat(" ").concat(input.author).concat(Time.now().toText());
    let newPost = {
      title = input.title;
      content = input.content;
      author = input.author;
      publishedAt = Time.now();
      coverImageId = input.coverImageId;
      tags = input.tags;
      id;
      status = #approved;
    };

    blogPosts.add(id, newPost);
    id;
  };

  public query func getBlogPostsByTag(tag : Text) : async [BlogPostMetadata] {
    blogPosts.values().toArray().filter(
      func(post) {
        switch (post.status) {
          case (#approved) {
            let hasTag = post.tags.find(func(t) { t == tag }).isSome();
            hasTag
          };
          case (_) { false };
        };
      }
    ).map(func(post) { { title = post.title; author = post.author; publishedAt = post.publishedAt; id = post.id } });
  };

  // No authentication required for admin functionality (frontend password gate handles security)
  public query func getAllBlogPostsAdmin() : async [BlogPost] { blogPosts.values().toArray() };

  public shared func approveBlogPost(id : Text) : async () {
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?post) {
        let updatedPost = {
          title = post.title;
          content = post.content;
          author = post.author;
          publishedAt = post.publishedAt;
          coverImageId = post.coverImageId;
          tags = post.tags;
          id = post.id;
          status = #approved;
        };
        blogPosts.add(id, updatedPost);
      };
    };
  };

  public shared func rejectBlogPost(id : Text) : async () {
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?post) {
        let updatedPost = {
          title = post.title;
          content = post.content;
          author = post.author;
          publishedAt = post.publishedAt;
          coverImageId = post.coverImageId;
          tags = post.tags;
          id = post.id;
          status = #rejected;
        };
        blogPosts.add(id, updatedPost);
      };
    };
  };

  // Subscription Functions (no auth required)
  public shared func subscribe(email : Text) : async Text {
    let id = email.concat(Time.now().toText());
    let subscription = { email; subscribedAt = Time.now(); id };
    subscriptions.add(id, subscription);
    id;
  };

  public query func getAllSubscriptions() : async [Subscription] { subscriptions.values().toArray() };

  // Site Configuration Functions (no auth required)
  public query func getSiteConfiguration() : async SiteConfiguration { siteConfig };

  public shared func updateSiteConfiguration(config : SiteConfiguration) : async () { siteConfig := config };

  // BlogPost Management (no auth required)
  public shared func updateBlogPost(id : Text, input : BlogPostInput) : async () {
    switch (blogPosts.get(id)) {
      case (null) { Runtime.trap("Blog post not found") };
      case (?existingPost) {
        let updatedPost = {
          title = input.title;
          content = input.content;
          author = input.author;
          publishedAt = existingPost.publishedAt;
          coverImageId = input.coverImageId;
          tags = input.tags;
          id = existingPost.id;
          status = existingPost.status;
        };
        blogPosts.add(id, updatedPost);
      };
    };
  };

  public shared func deleteBlogPost(id : Text) : async () {
    if (not blogPosts.containsKey(id)) { Runtime.trap("Blog post not found") };
    blogPosts.remove(id);
  };

  public shared func deleteSubscription(id : Text) : async () {
    if (not subscriptions.containsKey(id)) { Runtime.trap("Subscription not found") };
    subscriptions.remove(id);
  };

  // Video Functions (no auth required - frontend password gate)
  public shared func createVideo(input : VideoInput) : async Text {
    let id = input.title.concat(Time.now().toText());
    let video = {
      id;
      title = input.title;
      description = input.description;
      videoUrl = input.videoUrl;
      thumbnailUrl = input.thumbnailUrl;
      uploadedAt = Time.now();
    };
    videoPosts.add(id, video);
    id;
  };

  public query func getAllVideos() : async [VideoPost] {
    videoPosts.values().toArray();
  };

  public shared func updateVideo(id : Text, input : VideoInput) : async () {
    switch (videoPosts.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?existing) {
        let updated = {
          id = existing.id;
          title = input.title;
          description = input.description;
          videoUrl = input.videoUrl;
          thumbnailUrl = input.thumbnailUrl;
          uploadedAt = existing.uploadedAt;
        };
        videoPosts.add(id, updated);
      };
    };
  };

  public shared func deleteVideo(id : Text) : async () {
    if (not videoPosts.containsKey(id)) { Runtime.trap("Video not found") };
    videoPosts.remove(id);
  };
};
