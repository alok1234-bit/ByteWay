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
  type ApprovalStatus = {
    #pending;
    #approved;
    #rejected;
  };

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
    };
  };

  public type UserProfile = {
    name : Text;
  };

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
    blogPosts.values().toArray()
    .filter(func(blogPost) { 
      switch (blogPost.status) {
        case (#approved) { true };
        case (_) { false };
      };
    })
    .map(
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
      case (null) {
        Runtime.trap("Blog post not found");
      };
      case (?blogPost) {
        // Only return approved posts to public
        switch (blogPost.status) {
          case (#approved) { blogPost };
          case (_) { Runtime.trap("Blog post not available") };
        };
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

  public shared ({ caller }) func createBlogPost(input : BlogPostInput) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create blog posts");
    };

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

  public query func getBlogPostsByTag(tag : Text) : async [BlogPostMetadata] {
    blogPosts.values().toArray()
    .filter(func(post) { 
      // Only show approved posts
      let isApproved = switch (post.status) {
        case (#approved) { true };
        case (_) { false };
      };
      let hasTag = post.tags.find(func(t) { t == tag }).isSome();
      isApproved and hasTag;
    })
    .map(func(post) { 
      { 
        title = post.title; 
        author = post.author; 
        publishedAt = post.publishedAt; 
        id = post.id 
      } 
    });
  };

  // Admin-only: Get all posts including pending ones
  public query ({ caller }) func getAllBlogPostsAdmin() : async [BlogPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all posts");
    };
    blogPosts.values().toArray();
  };

  // Admin-only: Approve a blog post
  public shared ({ caller }) func approveBlogPost(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve blog posts");
    };

    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found");
      };
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

  // Admin-only: Reject a blog post
  public shared ({ caller }) func rejectBlogPost(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject blog posts");
    };

    switch (blogPosts.get(id)) {
      case (null) {
        Runtime.trap("Blog post not found");
      };
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

  // Subscription Functions - Anyone can subscribe (including guests)
  public shared func subscribe(email : Text) : async Text {
    let id = email.concat(Time.now().toText());
    let subscription = {
      email;
      subscribedAt = Time.now();
      id;
    };
    subscriptions.add(id, subscription);
    id;
  };

  // Admin-only: View all subscriptions
  public query ({ caller }) func getAllSubscriptions() : async [Subscription] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view subscriptions");
    };
    subscriptions.values().toArray();
  };

  // Site Configuration Functions - Public read, admin-only write
  public query func getSiteConfiguration() : async SiteConfiguration {
    siteConfig;
  };

  public shared ({ caller }) func updateSiteConfiguration(config : SiteConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update site configuration");
    };
    siteConfig := config;
  };
};
