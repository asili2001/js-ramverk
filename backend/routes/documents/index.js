
//var express = require('express');
import express from 'express';

var router = express.Router();


import getDocuments from './handlers/getDocuments.js';
import getSingleDocument from './handlers/getSingleDocument.js';
import createDocument from './handlers/createDocument.js';
import updateDocument from './handlers/updateDocument.js';
import deleteDocument from './handlers/deleteDocument.js';



router.get("/", getDocuments);

router.get("/:id", getSingleDocument);

router.post("/", createDocument);

router.put("/:id", updateDocument);

router.delete("/:id", deleteDocument);




export default router;
