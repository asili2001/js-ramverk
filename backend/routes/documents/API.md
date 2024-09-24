
# API Documentation
<br><br>




## GET /documents

Description:

    Get all documents


### Result examples:

#### On Success:
```json 
{
    "type": "success",
    "messages": [
        {
            "type": "success",
            "title": "Message: Success",
            "details": "Everything went ok"
        }
    ],
    "data": [
        {
            "_id": "66f32b800a4bfa5f05537216",
            "title": "some title for the document",
            "previewImage": null,
            "usersWithAccess": [
                {
                    "_id": "66f32b800a4bfa5f05537215",
                    "accessLevel": "owner"
                }
            ],
            "content": null
        }
    ]
}
```

#### On Failure:
```json 
{
    "errors": {
        "status": 500,
        "source": "/",
        "title": "Database error",
        "detail": "Database find query failed, Error explanation"
    }
}
```






<br><br>

## GET /documents/:id

Description:

    Get single document with :id


### Result examples:

#### On Success:
```json 
{
    "type": "success",
    "messages": [
        {
            "type": "success",
            "title": "Success!",
            "details": "No problems encountered. "
        }
    ],
    "data": {
        "_id": "66f32b800a4bfa5f05537216",
        "title": "THIS WILL BE MY DOCUMENT",
        "previewImage": null,
        "usersWithAccess": [
            {
                "_id": "66f32b800a4bfa5f05537215",
                "accessLevel": "owner"
            }
        ],
        "content": null
    }
}
```

#### On Failure:
```json 
{
    "type": "success",
    "messages": [
        {
            "type": "error",
            "title": "Warning!",
            "details": "No results found in the database"
        }
    ]
}
```


<br><br>

## POST /documents

Description:

    Create a new document. Don't forget to add these required fields in the body.




#### Example body:
```json
    {
        "title": "THIS WILL BE MY DOCUMENT"
    }
```

### Result examples:

#### On Success:
```json
{
    "type": "success",
    "messages": [
        {
            "type": "success",
            "title": "Message: Success",
            "details": "Everything went ok"
        }
    ],
    "data": {
        "acknowledged": true,
        "insertedId": "66f32b800a4bfa5f05537216"
    }
}
```

#### On Failure:
```json 
{
    "type": "success",
    "messages": [
        {
            "type": "error",
            "title": "Warning!",
            "details": "insertOne query failed"
        }
    ]
}
```




<br><br>

## PUT /documents/:id

Description:

    Update a single document with :id. Don't forget to add the body.




#### Example body:
```json
    {
        "title": "Updated title rollerblading",
        "previewImage": "some image",
        "content": "this is my updated content"
    }
```

### Result examples:

#### On Success:
```
    status 204
```

#### On Failure:
```
    status 500
```





<br><br>

## DELETE /documents/:id

Description:
    Delete a single document with :id


### Result examples:

#### On Success:
```
    status 204
```

#### On Failure:
```
    status 500
```


