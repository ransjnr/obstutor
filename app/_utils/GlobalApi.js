const { default: request, gql } = require("graphql-request");

const MASTER_URL =
  "https://eu-west-2.cdn.hygraph.com/content/cm5pdrtwh00ds07wa26qc5i3g/master";

const getAllCourseList = async () => {
  const query = gql`
    query MyQuery {
      courseLists {
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
      }
    }
  `;

  const result = await request(MASTER_URL, query);
  return result;
};

export default {
  getAllCourseList,
};
