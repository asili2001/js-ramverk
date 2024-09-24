
import documentsModel from '../../../models/documents.js';

const getSingleDocument = async function getSingleDocument(request, response) {
    try {
        const id = request.params.id;
        const data = await documentsModel.getSingleDocument(id);

        console.log("DATA RETURNED FROM DB", data);
        if (data) {
            response.json({
                type: "success",
                messages: [
                    {
                        type: "success",
                        title: "Success!",
                        details: "No problems encountered. "
                    }
                ],
                data: data
            });
        } else if(data == undefined) {
            response.json({
                type: "success",
                messages: [
                    {
                        type: "error",
                        title: "Warning!",
                        details: "No results found in the database"
                    }
                ],
                data: data
            });
        }

    } catch(error) {
        return response.status(500).json({
            errors: {
                status: 500,
                source: "/",
                title: "Database error",
                detail: error.message
            }
        });
    }
};

export default getSingleDocument;