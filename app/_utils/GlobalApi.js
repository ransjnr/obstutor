const { default: request, gql } = require("graphql-request");

const MASTER_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5pdrtwh00ds07wa26qc5i3g/master";

const getAllCourseList = async () => {
  const query = gql`
    query MyQuery {
      courseLists(first: 20, orderBy: createdAt_DESC) {
        author
        name
        id
        free
        description
        demoUrl
        banner {
          url
        }
        chapter {
          ... on Chapter {
            id
            name
            video {
              url
            }
          }
        }
        totalChapters
        tag
        slug
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

const getSideBanner = async () => {
  const query = gql`
    query GetSideBanner {
      sideBanners {
        id
        name
        banner {
          id
          url
        }
        url
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

const getCourseById = async (courseId) => {
  const query =
    gql`
    query GetCourseById {
      courseList(where: { slug: "` +
    courseId +
    `" }) {
        author
        banner {
          url
        }
        chapter {
          ... on Chapter {
            id
            name
            video {
              url
            }
          }
        }
        demoUrl
        description
        free
        id
        name
        slug
        tag
        totalChapters
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};
const enrollToCourse = async (courseId, email) => {
  const query =
    gql`
    mutation MyMutation {
      createUserEnrollCourse(
        data: {  
          courseId: "` +
    courseId +
    `"
          userEmail: "` +
    email +
    `"
          courseList: { connect: { slug: "` +
    courseId +
    `" } }
        }
      ) {
        id
      }
      publishManyUserEnrollCoursesConnection {
        edges {
          node {
            id
          }
        }
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

const checkUserEnrolledToCourse = async (courseId, email) => {
  const query =
    gql`
    query MyQuery {
      userEnrollCourses(
        where: {
          courseId: "` +
    courseId +
    `"
          userEmail: "` +
    email +
    `"
        }
      ) {
        id
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

const getUserEnrolledCourseDetails = async (id, email) => {
  const query =
    gql`
    query MyQuery {
      userEnrollCourses(where: { id: "` +
    id +
    `", userEmail: "` +
    email +
    `" }) {
        courseId
        id
        userEmail
        completedChapter {
          ... on CompletedChapter {
            id
            chapterId
          }
        }
        courseList {
          author
          banner {
            url
          }
          chapter {
            ... on Chapter {
              id
              name
              shortDesc
              video {
                url
              }
            }
          }
          demoUrl
          description
          free
          id
          name
          slug
          totalChapters
        }
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

export const markChapterCompleted = async (enrollId, chapterId) => {
  const query =
    gql`
    mutation MyMutation {
      updateUserEnrollCourse(
        data: {
          completedChapter: {
            create: { CompletedChapter: { data: { chapterId: "` +
    chapterId +
    `" } } }
          }
        }
        where: { id: "` +
    enrollId +
    `" }
      ){
        id
      }
      publishUserEnrollCourse(where: { id: "` +
    enrollId +
    `" }) {
        id
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

const getUserAllEnrolledCourseList = async (email) => {
  const query =
    gql`
    query MyQuery {
      userEnrollCourses(where: { userEmail: "` +
    email +
    `" }) {
        completedChapter {
          ... on CompletedChapter {
            id
            chapterId
          }
        }
        courseId
        courseList {
          author
          id
          name
          slug
          totalChapters
          free
          demoUrl
          description
          chapter {
            ... on Chapter {
              id
              name
            }
          }
          banner {
            url
          }
        }
      }
    }
  `;
  const result = await request(MASTER_URL, query);
  return result;
};

export const getNotifications = async () => {
  // Mock API call to fetch notifications
  return [
    { id: 1, message: "New course available!" },
    { id: 2, message: "Chapter completed!" },
  ];
};

export const markNotificationAsRead = async (id) => {
  // Mock API call to mark a notification as read
  console.log(`Notification ${id} marked as read.`);
};

export const sendEmailNotification = async (email, message) => {
  // Mock API call to send an email notification
  console.log(`Email sent to ${email}: ${message}`);
};

export default {
  getAllCourseList,
  getSideBanner,
  getCourseById,
  enrollToCourse,
  checkUserEnrolledToCourse,
  getUserEnrolledCourseDetails,
  markChapterCompleted,
  getUserAllEnrolledCourseList,
};
