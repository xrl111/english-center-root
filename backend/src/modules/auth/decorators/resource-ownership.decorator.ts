import { SetMetadata } from '@nestjs/common';
import { BaseUser, Resource } from '../types/common';

export const RESOURCE_OWNERSHIP_KEY = 'resourceOwnership';

export type CustomAccessCheck = (user: BaseUser, resource: Resource) => boolean;

export interface ResourceOwnership {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions: {
    isOwner?: boolean;
    isInstructor?: boolean;
    isEnrolled?: boolean;
    custom?: CustomAccessCheck;
  };
}

/**
 * Decorator to specify resource ownership requirements for a route
 * @param ownership Resource ownership configuration
 */
export const RequireResourceOwnership = (ownership: ResourceOwnership) =>
  SetMetadata(RESOURCE_OWNERSHIP_KEY, ownership);

/**
 * Predefined resource ownership configurations
 */
export const ResourceOwnershipRules = {
  /**
   * Only the owner of the resource can access it
   * @param resource The resource type
   */
  OwnerOnly: (resource: string): ResourceOwnership => ({
    resource,
    action: 'read',
    conditions: {
      isOwner: true,
    },
  }),

  /**
   * Only the instructor of the course can access it
   * @param resource The resource type
   */
  InstructorOnly: (resource: string): ResourceOwnership => ({
    resource,
    action: 'read',
    conditions: {
      isInstructor: true,
    },
  }),

  /**
   * Only enrolled students can access the resource
   * @param resource The resource type
   */
  EnrolledOnly: (resource: string): ResourceOwnership => ({
    resource,
    action: 'read',
    conditions: {
      isEnrolled: true,
    },
  }),

  /**
   * Owner or instructor can access the resource
   * @param resource The resource type
   */
  OwnerOrInstructor: (resource: string): ResourceOwnership => ({
    resource,
    action: 'read',
    conditions: {
      custom: (user: BaseUser, resource: Resource): boolean => {
        if (!resource.userId && !resource.course) return false;
        
        const isOwner = resource.userId?.toString() === user.id;
        const isInstructor = resource.course && user.instructingCourses.some(courseId => 
          courseId.toString() === resource.course?.toString()
        );
        return isOwner || (isInstructor ?? false);
      },
    },
  }),

  /**
   * Owner or enrolled student can access the resource
   * @param resource The resource type
   */
  OwnerOrEnrolled: (resource: string): ResourceOwnership => ({
    resource,
    action: 'read',
    conditions: {
      custom: (user: BaseUser, resource: Resource): boolean => {
        if (!resource.userId && !resource.course) return false;

        const isOwner = resource.userId?.toString() === user.id;
        const isEnrolled = resource.course && user.enrolledCourses.some(courseId => 
          courseId.toString() === resource.course?.toString()
        );
        return isOwner || (isEnrolled ?? false);
      },
    },
  }),

  /**
   * Custom resource ownership check
   * @param resource The resource type
   * @param check Custom check function
   */
  Custom: (
    resource: string,
    check: CustomAccessCheck
  ): ResourceOwnership => ({
    resource,
    action: 'read',
    conditions: {
      custom: check,
    },
  }),
};

/**
 * Shorthand decorators for common resource ownership patterns
 */
export const RequireOwnership = (resource: string) =>
  RequireResourceOwnership(ResourceOwnershipRules.OwnerOnly(resource));

export const RequireInstructor = (resource: string) =>
  RequireResourceOwnership(ResourceOwnershipRules.InstructorOnly(resource));

export const RequireEnrollment = (resource: string) =>
  RequireResourceOwnership(ResourceOwnershipRules.EnrolledOnly(resource));

export const RequireOwnerOrInstructor = (resource: string) =>
  RequireResourceOwnership(ResourceOwnershipRules.OwnerOrInstructor(resource));

export const RequireOwnerOrEnrolled = (resource: string) =>
  RequireResourceOwnership(ResourceOwnershipRules.OwnerOrEnrolled(resource));

/**
 * Helper function to create a custom resource ownership rule
 * @param resource The resource type
 * @param check Custom check function
 */
export const createCustomOwnershipRule = (
  resource: string,
  check: CustomAccessCheck
): ResourceOwnership => ResourceOwnershipRules.Custom(resource, check);