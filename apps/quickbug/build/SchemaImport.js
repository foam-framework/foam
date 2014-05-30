/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var SCHEMA_URL = 'https://www-googleapis-test.sandbox.google.com/discovery/v1/apis/projecthosting/v2/rest';

/*

https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/<project-name>
https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/<project-name>/issues
https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/<project-name>/issues/<issue-id>
https://www-googleapis-staging.sandbox.google.com/projecthosting/v2/projects/<project-name>/issues/<issue-id>/comments

*/
/*
var xhr = new XMLHttpRequest();
xhr.open("GET", SCHEMA_URL);
xhr.asend(function(res) {
  console.log('res: ', res);
});
*/

var CIssueSchema = {
 "kind": "discovery#restDescription",
 "etag": "\"C5msW6wP1tqAj5JAsdC90lJ4Iu0/XT_5sdvafTWXVFsJ7KQsY1TCuns\"",
 "discoveryVersion": "v1",
 "id": "projecthosting:v2",
 "name": "projecthosting",
 "version": "v2",
 "revision": "20120422",
 "title": "Project Hosting API",
 "description": "Google Code Project Hosting API",
 "ownerDomain": "google.com",
 "ownerName": "Google",
 "icons": {
  "x16": "http://www.google.com/images/icons/product/projecthosting-16.png",
  "x32": "http://www.google.com/images/icons/product/projecthosting-32.png"
 },
 "protocol": "rest",
 "baseUrl": "https://www-googleapis-test.sandbox.google.com/projecthosting/v2/",
 "basePath": "/projecthosting/v2/",
 "rootUrl": "https://www-googleapis-test.sandbox.google.com/",
 "servicePath": "projecthosting/v2/",
 "batchPath": "batch",
 "parameters": {
  "alt": {
   "type": "string",
   "description": "Data format for the response.",
   "default": "json",
   "enum": [
    "json"
   ],
   "enumDescriptions": [
    "Responses with Content-Type of application/json"
   ],
   "location": "query"
  },
  "fields": {
   "type": "string",
   "description": "Selector specifying which fields to include in a partial response.",
   "location": "query"
  },
  "key": {
   "type": "string",
   "description": "API key. Your API key identifies your project and provides you with API access, quota, and reports. Required unless you provide an OAuth 2.0 token.",
   "location": "query"
  },
  "oauth_token": {
   "type": "string",
   "description": "OAuth 2.0 token for the current user.",
   "location": "query"
  },
  "prettyPrint": {
   "type": "boolean",
   "description": "Returns response with indentations and line breaks.",
   "default": "true",
   "location": "query"
  },
  "quotaUser": {
   "type": "string",
   "description": "Available to use for quota purposes for server-side applications. Can be any arbitrary string assigned to a user, but should not exceed 40 characters. Overrides userIp if both are provided.",
   "location": "query"
  },
  "userIp": {
   "type": "string",
   "description": "IP address of the site where the request originates. Use this if you want to enforce per-user limits.",
   "location": "query"
  }
 },
 "auth": {
  "oauth2": {
   "scopes": {
    "https://www.googleapis.com/auth/projecthosting": {
     "description": "Manage your user profile and projects on Project Hosting"
    }
   }
  }
 },
 "schemas": {
  "Issue": {
   "id": "Issue",
   "type": "object",
   "properties": {
    "author": {
     "$ref": "IssuePerson",
     "description": "Person who originally filed this issue."
    },
    "blockedOn": {
     "type": "array",
     "description": "References to issues this issue is blocked on.",
     "items": {
      "$ref": "IssueRef"
     }
    },
    "blocking": {
     "type": "array",
     "description": "References to issues blocking on this issue.",
     "items": {
      "$ref": "IssueRef"
     }
    },
    "cc": {
     "type": "array",
     "description": "List of people who are CC'ed on updates to this issue.",
     "items": {
      "$ref": "IssuePerson"
     }
    },
    "closed": {
     "type": "string",
     "description": "Date and time the issue was closed.",
     "format": "date-time"
    },
    "description": {
     "type": "string",
     "description": "Description of the issue."
    },
    "id": {
     "type": "integer",
     "description": "ID of the issue, unique to this project.",
     "format": "int32"
    },
    "kind": {
     "type": "string",
     "description": "Issue tracked by Google Project Hosting.",
     "default": "projecthosting#issue"
    },
    "labels": {
     "type": "array",
     "description": "Labels for this issue.",
     "items": {
      "type": "string"
     }
    },
    "mergedInto": {
     "$ref": "IssueRef",
     "description": "Reference to the issue this issue was merged into."
    },
    "movedFrom": {
     "$ref": "IssueRef",
     "description": "Reference to the issue this issue was moved from."
    },
    "movedTo": {     "type": "array",
     "description": "Reference to the issue(s) this issue was moved to.",
     "items": {
      "$ref": "IssueRef"
     }
    },
    "owner": {
     "$ref": "IssuePerson",
     "description": "Person to whom this issue is currently assigned."
    },
    "projectId": {
     "type": "string",
     "description": "Reference to the project to which this issue belongs."
    },
    "published": {
     "type": "string",
     "description": "Date and time the issue was originally published.",
     "format": "date-time"
    },
    "starred": {
     "type": "boolean",
     "description": "Whether the authenticated user has starred this issue."
    },
    "stars": {
     "type": "integer",
     "description": "Number of stars this issue has.",
     "format": "int32"
    },
    "state": {
     "type": "string",
     "description": "State of this issue (open or closed)."
    },
    "status": {
     "type": "string",
     "description": "Status of this issue."
    },
    "summary": {
     "type": "string",
     "description": "One-line summary of the issue."
    },
    "title": {
     "type": "string",
     "description": "DEPRECATED."
    },
    "updated": {
     "type": "string",
     "description": "Date and time the issue was last updated.",
     "format": "date-time"
    }
   }
  },
  "IssueComment": {
   "id": "IssueComment",
   "type": "object",
   "properties": {
    "author": {
     "$ref": "IssuePerson",
     "description": "Person who authored this comment."
    },
    "canDelete": {
     "type": "boolean",
     "description": "Whether the authenticated user can delete this comment."
    },
    "content": {
     "type": "string",
     "description": "Content of this issue comment."
    },
    "deletedBy": {
     "$ref": "IssuePerson",
     "description": "Person who deleted this comment."
    },
    "id": {
     "type": "integer",
     "description": "0-based sequence number of this comment, unique to this issue.",
     "format": "int32"
    },
    "kind": {
     "type": "string",
     "description": "Comment on an issue tracked by Google Project Hosting.",
     "default": "projecthosting#issueComment"
    },
    "published": {
     "type": "string",
     "description": "Date and time the issue was last updated.",
     "format": "date-time"
    },
    "updates": {
     "$ref": "IssueCommentUpdate"
    }
   }
  },
  "IssueCommentList": {
   "id": "IssueCommentList",
   "type": "object",
   "properties": {
    "htmlLink": {
     "type": "string",
     "description": "Link to the page for this list of issue comments."
    },
    "items": {
     "type": "array",
     "description": "Items in the list.",
     "items": {
      "$ref": "IssueComment"
     }
    },
    "kind": {
     "type": "string",
     "description": "A list of comments on an issue.",
     "default": "projecthosting#issueCommentList"
    },
    "totalResults": {
     "type": "integer",
     "description": "The total number of issue comments matching the request.",
     "format": "uint32"
    }
   }
  },
  "IssueCommentUpdate": {
   "id": "IssueCommentUpdate",
   "type": "object",
   "properties": {
    "blockedOn": {
     "type": "array",
     "description": "Changes made to the list of issues blocked on this issue.",
     "items": {
      "type": "string"
     }
    },
    "blocking": {
     "type": "array",
     "description": "Changes made to the list of issues blocking this issue.",
     "items": {
      "type": "string"
     }
    },
    "cc": {
     "type": "array",
     "description": "Changes made to the issue's cc list.",
     "items": {
      "type": "string"
     }
    },
    "kind": {
     "type": "string",
     "description": "Metadata updates made as part of a comment.",
     "default": "projecthosting#issueCommentUpdate"
    },
    "labels": {
     "type": "array",
     "description": "Changes made to the issue's labels.",
     "items": {
      "type": "string"
     }
    },
    "mergedInto": {
     "type": "string",
     "description": "ID of the issue this issue has been merged into."
    },
    "owner": {
     "type": "string",
     "description": "Updated owner of the issue."
    },
    "status": {
     "type": "string",
     "description": "Updated status of the issue."
    },
    "summary": {
     "type": "string",
     "description": "Updated summary of the issue."
    }
   }
  },
  "IssueList": {
   "id": "IssueList",
   "type": "object",
   "properties": {
    "htmlLink": {
     "type": "string",
     "description": "Link to the page for this list of issues."
    },
    "items": {
     "type": "array",
     "items": {
      "$ref": "Issue"
     }
    },
    "kind": {
     "type": "string",
     "description": "List of issues tracked by Google Project Hosting.",
     "default": "projecthosting#issueList"
    },
    "totalResults": {
     "type": "integer",
     "description": "The total number of issues matching the request.",
     "format": "uint32"
    }
   }
  },
  "IssuePerson": {
   "id": "IssuePerson",
   "type": "object",
   "properties": {
    "htmlLink": {
     "type": "string",
     "description": "Link to this user's page."
    },
    "kind": {
     "type": "string",
     "default": "projecthosting#issuePerson"
    },
    "name": {
     "type": "string",
     "description": "User's name."
    }
   }
  },
  "IssueRef": {
   "id": "IssueRef",
   "type": "object",
   "properties": {
    "issueId": {
     "type": "integer",
     "description": "ID of the issue.",
     "format": "int32"
    },
    "kind": {
     "type": "string",
     "description": "Reference to an issue.",
     "default": "projecthosting#issueRef"
    },
    "projectId": {
     "type": "string",
     "description": "ID of the project."
    }
   }
  },
  "Project": {
   "id": "Project",
   "type": "object",
   "properties": {
    "description": {
     "type": "string",
     "description": "Description of the project."
    },
    "domain": {
     "type": "string",
     "description": "Domain in which this project exists."
    },
    "externalId": {
     "type": "string",
     "description": "Single string identifier of the project, encoding the name and domain."
    },
    "htmlLink": {
     "type": "string",
     "description": "URL of the project home page."
    },
    "issuesConfig": {
     "$ref": "ProjectIssueConfig",
     "description": "Information about how issues are handled for this project."
    },
    "kind": {
     "type": "string",
     "description": "Project hosted by Google Code Project Hosting.",
     "default": "projecthosting#project"
    },
    "labels": {
     "type": "array",
     "description": "Labels that have been applied to this project by the project's owners.",
     "items": {
      "type": "string"
     }
    },
    "members": {
     "type": "array",
     "description": "List of members of this project.",
     "items": {
      "$ref": "IssuePerson"
     }
    },
    "name": {
     "type": "string",
     "description": "Name of the project."
    },
    "repositoryUrls": {
     "type": "array",
     "description": "URLs where the source for the project can be checked out.",
     "items": {
      "type": "string"
     }
    },
    "role": {
     "type": "string",
     "description": "The user's role in the project, if there is one."
    },
    "summary": {
     "type": "string",
     "description": "Short summary of the project."
    },
    "versionControlSystem": {
     "type": "string",
     "description": "Version control system used by the project."
    }
   }
  },
  "ProjectIssueConfig": {
   "id": "ProjectIssueConfig",
   "type": "object",
   "properties": {
    "defaultColumns": {
     "type": "array",
     "description": "Default column ordering defined for this project.",
     "items": {
      "type": "string"
     }
    },
    "defaultPromptForMembers": {
     "type": "integer",
     "description": "Index into the prompts list of the default prompt for project members.",
     "format": "int32"
    },
    "defaultPromptForNonMembers": {
     "type": "integer",
     "description": "Index into the prompts list of the default prompt for non-project-members.",
     "format": "int32"
    },
    "defaultSorting": {
     "type": "array",
     "description": "Default sort specification defined for this project.",
     "items": {
      "type": "string"
     }
    },
    "kind": {
     "type": "string",
     "description": "Issue tracker configuration for a project.",
     "default": "projecthosting#projectIssueConfig"
    },
    "labels": {
     "type": "array",
     "description": "Pre-defined issue labels configured for this project, e.g., \"Type-Defect\", \"Priority-Medium\", etc.",
     "items": {
      "type": "object",
      "properties": {
       "description": {
        "type": "string",
        "description": "Description of the label."
       },
       "label": {
        "type": "string",
        "description": "Name of the label."
       }
      }
     }
    },
    "prompts": {
     "type": "array",
     "description": "Pre-defined issue prompts configured for this project, e.g., \"User defect report\", \"Review request\", etc.",
     "items": {
      "type": "object",
      "properties": {
       "defaultToMember": {
        "type": "boolean",
        "description": "Whether this prompt should default the owner of the issue to the project member filing the issue."
       },
       "description": {
        "type": "string",
        "description": "Default description of the issue."
       },
       "labels": {
        "type": "array",
        "description": "Labels for the prompt.",
        "items": {
         "type": "string"
        }
       },
       "membersOnly": {
        "type": "boolean",
        "description": "Whether this prompt should only be shown to project members."
       },
       "name": {
        "type": "string",
        "description": "Name of the prompt."
       },
       "status": {
        "type": "string",
        "description": "Status of the prompt."
       },
       "title": {
        "type": "string",
        "description": "Default title of the issue."
       },
       "titleMustBeEdited": {
        "type": "boolean",
        "description": "Whether or not the issue title must be edited before submitting the issue."
       }
      }
     }
    },
    "restrictToKnown": {
     "type": "boolean",
     "description": "Whether or not the project restricts issue labels and statuses to the pre-defined values."
    },
    "statuses": {
     "type": "array",
     "description": "Pre-defined issue statuses configured for this project, e.g., \"New\", \"Accepted\", etc.",
     "items": {
      "type": "object",
      "properties": {
       "description": {
        "type": "string",
        "description": "Description of this status."
       },
       "meansOpen": {
        "type": "boolean",
        "description": "Whether or not this status denotes the issue is \"open\"."
       },
       "status": {
        "type": "string",
        "description": "Name of the status."
       }
      }
     }
    },
    "usersCanSetLabels": {
     "type": "boolean",
     "description": "Whether non-project-members can set labels on new issues."
    }
   }
  },
  "User": {
   "id": "User",
   "type": "object",
   "properties": {
    "id": {
     "type": "string",
     "description": "User identifier."
    },
    "kind": {
     "type": "string",
     "description": "User on Google Code Project Hosting.",
     "default": "projecthosting#user"
    },
    "projects": {
     "type": "array",
     "description": "Projects of which this user is a member.",
     "items": {
      "$ref": "Project"
     }
    }
   }
  }
 },
 "resources": {
  "issues": {
   "methods": {
    "get": {
     "id": "projecthosting.issues.get",
     "path": "projects/{projectId}/issues/{issueId}",
     "httpMethod": "GET",
     "description": "Get information about an Issue",
     "parameters": {
      "issueId": {
       "type": "integer",
       "description": "ID of the issue",
       "required": true,
       "format": "int32",
       "location": "path"
      },
      "projectId": {
       "type": "string",
       "description": "Identifier of the project.",
       "required": true,
       "location": "path"
      }
     },
     "parameterOrder": [
      "projectId",
      "issueId"
     ],
     "response": {
      "$ref": "Issue"
     },
     "scopes": [
      "https://www.googleapis.com/auth/projecthosting"
     ]
    },
    "insert": {
     "id": "projecthosting.issues.insert",
     "path": "projects/{projectId}/issues",
     "httpMethod": "POST",
     "description": "Create a new issue for the project",
     "parameters": {
      "projectId": {
       "type": "string",
       "description": "Identifier of the project.",
       "required": true,
       "location": "path"
      },
      "sendEmail": {
       "type": "boolean",
       "description": "Whether or not an email notification should be sent for the creation of this issue.",
       "default": "true",
       "location": "query"
      }
     },
     "parameterOrder": [
      "projectId"
     ],
     "request": {
      "$ref": "Issue"
     },
     "response": {
      "$ref": "Issue"
     },
     "scopes": [
      "https://www.googleapis.com/auth/projecthosting"
     ],
     "supportsMediaUpload": true,
     "mediaUpload": {
      "accept": [
       "application/excel",
       "application/ms",
       "application/octet-stream",
       "application/vnd.",
       "application/x-ms",
       "application/x-vnd.",
       "application/x-zip",
       "application/zip",
       "audio/*",
       "image/*",
       "video/*"
      ],
      "maxSize": "2MB",
      "protocols": {
       "simple": {
        "multipart": true,
        "path": "/upload/projecthosting/v2/projects/{projectId}/issues"
       },
       "resumable": {
        "multipart": true,
        "path": "/resumable/upload/projecthosting/v2/projects/{projectId}/issues"
       }
      }
     }
    },
    "list": {
     "id": "projecthosting.issues.list",
     "path": "projects/{projectId}/issues",
     "httpMethod": "GET",
     "description": "Lists issues belonging to this project",
     "parameters": {
      "additionalProject": {
       "type": "string",
       "description": "Additional projects under which to perform this issue search",
       "repeated": true,
       "location": "query"
      },
      "can": {
       "type": "string",
       "description": "Use a canned query",
       "enum": [
        "all",
        "new",
        "open",
        "owned",
        "reported",
        "starred",
        "to-verify"
       ],
       "enumDescriptions": [
        "All Issues",
        "New issues",
        "Open Issues",
        "Open and owned by me (requires auth)",
        "Open and reported by me (requires auth)",
        "Open and starred by me (requires auth)",
        "Issues to verify"
       ],
       "location": "query"
      },
      "label": {
       "type": "string",
       "description": "The type of issues to return based on the label set on the issue.",
       "location": "query"
      },
      "maxResults": {
       "type": "integer",
       "description": "The maximum number of entries to return",
       "format": "int32",
       "location": "query"
      },
      "owner": {
       "type": "string",
       "description": "Return issues based on the owner of the issue. For Gmail users, this will be the part of the email preceding the '@' sign.",
       "location": "query"
      },
      "projectId": {
       "type": "string",
       "description": "Identifier of the project.",
       "required": true,
       "location": "path"
      },
      "publishedMax": {
       "type": "string",
       "description": "Maximum published date",
       "format": "int64",
       "location": "query"
      },
      "publishedMin": {
       "type": "string",
       "description": "Minimum published date",
       "format": "int64",
       "location": "query"
      },
      "q": {
       "type": "string",
       "description": "Return issues based on a full text search.",
       "location": "query"
      },
      "sort": {
       "type": "string",
       "description": "Sort specification.",
       "default": "-id",
       "location": "query"
      },
      "startIndex": {
       "type": "integer",
       "description": "The 1-based index of the first result to be retrieved (for paging).",
       "format": "int32",
       "location": "query"
      },
      "status": {
       "type": "string",
       "description": "Return issues based on the status of the issue.",
       "location": "query"
      },
      "updatedMax": {
       "type": "string",
       "description": "Maximum updated date",
       "format": "int64",
       "location": "query"
      },
      "updatedMin": {
       "type": "string",
       "description": "Minimum updated date",
       "format": "int64",
       "location": "query"
      }
     },
     "parameterOrder": [
      "projectId"
     ],
     "response": {
      "$ref": "IssueList"
     },
     "scopes": [
      "https://www.googleapis.com/auth/projecthosting"
     ]
    },
    "star": {
     "id": "projecthosting.issues.star",
     "path": "projects/{projectId}/issues/{issueId}/star",
     "httpMethod": "POST",
     "description": "Stars this issue",
     "parameters": {
      "issueId": {
       "type": "integer",
       "description": "ID of the issue",
       "required": true,
       "format": "int32",
       "location": "path"
      },
      "projectId": {
       "type": "string",
       "description": "Identifier of the project.",
       "required": true,
       "location": "path"
      }
     },
     "parameterOrder": [
      "projectId",
      "issueId"
     ],
     "scopes": [
      "https://www.googleapis.com/auth/projecthosting"
     ]
    },
    "unstar": {
     "id": "projecthosting.issues.unstar",
     "path": "projects/{projectId}/issues/{issueId}/unstar",
     "httpMethod": "POST",
     "description": "Stars this issue",
     "parameters": {
      "issueId": {
       "type": "integer",
       "description": "ID of the issue",
       "required": true,
       "format": "int32",
       "location": "path"
      },
      "projectId": {
       "type": "string",
       "description": "Identifier of the project.",
       "required": true,
       "location": "path"
      }
     },
     "parameterOrder": [
      "projectId",
      "issueId"
     ],
     "scopes": [
      "https://www.googleapis.com/auth/projecthosting"
     ]
    }
   },
   "resources": {
    "comments": {
     "methods": {
      "delete": {
       "id": "projecthosting.issues.comments.delete",
       "path": "projects/{projectId}/issues/{issueId}/comments/{commentId}",
       "httpMethod": "DELETE",
       "description": "Deletes a comment on an issue",
       "parameters": {
        "commentId": {
         "type": "integer",
         "description": "ID of the comment",
         "required": true,
         "format": "int32",
         "location": "path"
        },
        "issueId": {
         "type": "integer",
         "description": "ID of the issue",
         "required": true,
         "format": "int32",
         "location": "path"
        },
        "projectId": {
         "type": "string",
         "description": "Identifier of the project.",
         "required": true,
         "location": "path"
        }
       },
       "parameterOrder": [
        "projectId",
        "issueId",
        "commentId"
       ],
       "scopes": [
        "https://www.googleapis.com/auth/projecthosting"
       ]
      },
      "insert": {
       "id": "projecthosting.issues.comments.insert",
       "path": "projects/{projectId}/issues/{issueId}/comments",
       "httpMethod": "POST",
       "description": "Creates a new comment on an issue, potentially updating the issue",
       "parameters": {
        "issueId": {
         "type": "integer",
         "description": "ID of the issue",
         "required": true,
         "format": "int32",
         "location": "path"
        },
        "projectId": {
         "type": "string",
         "description": "Identifier of the project.",
         "required": true,
         "location": "path"
        },
        "sendEmail": {
         "type": "boolean",
         "description": "Whether or not an email notification should be sent for this change.",
         "default": "true",
         "location": "query"
        }
       },
       "parameterOrder": [
        "projectId",
        "issueId"
       ],
       "request": {
        "$ref": "IssueComment"
       },
       "response": {
        "$ref": "IssueComment"
       },
       "scopes": [
        "https://www.googleapis.com/auth/projecthosting"
       ],
       "supportsMediaUpload": true,
       "mediaUpload": {
        "accept": [
         "application/excel",
         "application/ms",
         "application/octet-stream",
         "application/vnd.",
         "application/x-ms",
         "application/x-vnd.",
         "application/x-zip",
         "application/zip",
         "audio/*",
         "image/*",
         "video/*"
        ],
        "maxSize": "2MB",
        "protocols": {
         "simple": {
          "multipart": true,
          "path": "/upload/projecthosting/v2/projects/{projectId}/issues/{issueId}/comments"
         },
         "resumable": {
          "multipart": true,
          "path": "/resumable/upload/projecthosting/v2/projects/{projectId}/issues/{issueId}/comments"
         }
        }
       }
      },
      "list": {
       "id": "projecthosting.issues.comments.list",
       "path": "projects/{projectId}/issues/{issueId}/comments",
       "httpMethod": "GET",
       "description": "Lists comments on an issue",
       "parameters": {
        "issueId": {
         "type": "integer",
         "description": "ID of the issue",
         "required": true,
         "format": "int32",
         "location": "path"
        },
        "maxResults": {
         "type": "integer",
         "description": "The maximum number of entries to return",
         "format": "int32",
         "location": "query"
        },
        "projectId": {
         "type": "string",
         "description": "Identifier of the project.",
         "required": true,
         "location": "path"
        },
        "startIndex": {
         "type": "integer",
         "description": "The 1-based index of the first result to be retrieved (for paging).",
         "format": "int32",
         "location": "query"
        }
       },
       "parameterOrder": [
        "projectId",
        "issueId"
       ],
       "response": {
        "$ref": "IssueCommentList"
       },
       "scopes": [
        "https://www.googleapis.com/auth/projecthosting"
       ]
      },
      "undelete": {
       "id": "projecthosting.issues.comments.undelete",
       "path": "projects/{projectId}/issues/{issueId}/comments/{commentId}/undelete",
       "httpMethod": "POST",
       "description": "Undeletes a comment on an issue",
       "parameters": {
        "commentId": {
         "type": "integer",
         "description": "ID of the comment",
         "required": true,
         "format": "int32",
         "location": "path"
        },
        "issueId": {
         "type": "integer",
         "description": "ID of the issue",
         "required": true,
         "format": "int32",
         "location": "path"
        },
        "projectId": {
         "type": "string",
         "description": "Identifier of the project.",
         "required": true,
         "location": "path"
        }
       },
       "parameterOrder": [
        "projectId",
        "issueId",
        "commentId"
       ],
       "scopes": [
        "https://www.googleapis.com/auth/projecthosting"
       ]
      }
     }
    }
   }
  },
  "projects": {
   "methods": {
    "get": {
     "id": "projecthosting.projects.get",
     "path": "projects/{projectId}",
     "httpMethod": "GET",
     "description": "Gets a project by its ID",
     "parameters": {
      "projectId": {
       "type": "string",
       "description": "Identifier of the project.",
       "required": true,
       "location": "path"
      }
     },
     "parameterOrder": [
      "projectId"
     ],
     "response": {
      "$ref": "Project"
     },
     "scopes": [
      "https://www.googleapis.com/auth/projecthosting"
     ]
    }
   }
  },
  "users": {
   "methods": {
    "get": {
     "id": "projecthosting.users.get",
     "path": "users/{userId}",
     "httpMethod": "GET",
     "description": "Gets information about a user",
     "parameters": {
      "userId": {
       "type": "string",
       "description": "Identifier of the user. The value \"me\" will return the authenticated user.",
       "required": true,
       "location": "path"
      }
     },
     "parameterOrder": [
      "userId"
     ],
     "response": {
      "$ref": "User"
     },
     "scopes": [
      "https://www.googleapis.com/auth/projecthosting"
     ]
    }
   }
  }
 }
};


var typeModels = {
  array: ArrayProperty,
  boolean: BooleanProperty,
  dateTime: DateTimeProperty,
  float: FloatProperty,
  integer: IntProperty,
  ref: ReferenceProperty,
  refArray: ReferenceArrayProperty,
  string: StringProperty,
  stringArray: StringArrayProperty
};


function generateModel(schema) {
  var mps = [];

  Object_forEach(schema.properties, function(p, name) {
    if ( p.type == 'array' && p.items.$ref ) p.type = 'refArray';
    if ( p.type == 'array' && p.items.type == 'string' ) p.type = 'stringArray';
    if ( p.format == 'date-time' ) p.type = 'dateTime';
    if ( ! p.type && p.ref ) p.type = 'ref';

    var ref = p.$ref || (p.items && p.items.$ref);
    if ( ref == 'IssueRef' ) ref = 'Issue';

    var pModel = typeModels[p.type] || Property;
    var prop = pModel.create({
      name: name,
//      type: p.type,
      help: p.description
    });
    if ( ref ) {
      prop.subType = ref;
    }
    mps.push(prop);
  });

  return Model.create({
    name: schema.id,
    properties: mps
  });
}

Object_forEach(CIssueSchema.schemas, function(value, key) {
  console.log('key: ', key);
});

var CrIssue = generateModel(CIssueSchema.schemas.Issue);
var IssueComment = generateModel(CIssueSchema.schemas.IssueComment);

var exports = [
   CIssueSchema.schemas.Issue,
   CIssueSchema.schemas.IssueComment,
   CIssueSchema.schemas.IssuePerson,
   CIssueSchema.schemas.Project,
   CIssueSchema.schemas.IssueCommentUpdate,
   CIssueSchema.schemas.User,
   CIssueSchema.schemas.ProjectIssueConfig
];

console.log(
   exports.map(function(m) {
      var model = generateModel(m);
      return 'var Generated' + model.name + ' = FOAM(' + model.toJSON() + ');'; }).join('\n\n'));
