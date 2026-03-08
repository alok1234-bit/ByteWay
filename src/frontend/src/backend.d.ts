import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Subscription {
    id: string;
    subscribedAt: Time;
    email: string;
}
export interface BlogPostMetadata {
    id: string;
    title: string;
    publishedAt: Time;
    author: string;
}
export interface BlogPost {
    id: string;
    status: ApprovalStatus;
    title: string;
    content: string;
    coverImageId?: string;
    tags: Array<string>;
    publishedAt: Time;
    author: string;
}
export type Time = bigint;
export interface BlogPostInput {
    title: string;
    content: string;
    coverImageId?: string;
    tags: Array<string>;
    author: string;
}
export interface SiteConfiguration {
    email: string;
    address: string;
    phone: string;
    socialMedia: {
        linkedin: string;
        twitter: string;
        instagram: string;
        facebook: string;
    };
}
export interface UserProfile {
    name: string;
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveBlogPost(id: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createBlogPost(input: BlogPostInput): Promise<string>;
    getAllBlogPostMetadata(): Promise<Array<BlogPostMetadata>>;
    getAllBlogPostsAdmin(): Promise<Array<BlogPost>>;
    getAllSubscriptions(): Promise<Array<Subscription>>;
    getBlogPostById(id: string): Promise<BlogPost>;
    getBlogPostsByTag(tag: string): Promise<Array<BlogPostMetadata>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSiteConfiguration(): Promise<SiteConfiguration>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectBlogPost(id: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    subscribe(email: string): Promise<string>;
    updateSiteConfiguration(config: SiteConfiguration): Promise<void>;
}
