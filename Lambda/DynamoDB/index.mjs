import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const USERS_TABLE = "Your_Table Name";     //replace Your_Table_Name with your dynamodb table's name.

// Create DynamoDB Client
const client = new DynamoDBClient({ region: "Your_Region_Name" });   //replace Your_Region_Name with your AWS region for the dynamodb table.
const ddb = client;

export const handler = async (event) => {
    const { httpMethod, body, pathParameters } = event;
    let response;

    switch (httpMethod) {
        case "POST":
            response = await createUser(body);
            break;
        case "GET":
            if (pathParameters && pathParameters.id) {
                response = await readUser(pathParameters.id); // Fetch specific user by email
            } else {
                response = await getUsers();
            }
            break;
        case "PUT":
            response = await updateUser(pathParameters.id, body); // Update specific user by email
            break;
        case "DELETE":
            response = await deleteUser(pathParameters.id); // Delete specific user by email
            break;
        default:
            response = {
                statusCode: 405,
                body: JSON.stringify({ error: "Method Not Allowed" }),
            };
            break;
    }

    return response;
};

// Helper Functions

const createUser = async (body) => {
    const { email, name, username, password, role } = JSON.parse(body);
    const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: { email, name, username, password, role },
    });

    try {
        await ddb.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User created successfully." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

const getUsers = async () => {
    const command = new ScanCommand({
        TableName: USERS_TABLE,
    });

    try {
        const data = await ddb.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(data.Items || []),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

const readUser = async (email) => {
    const command = new GetCommand({
        TableName: USERS_TABLE,
        Key: { email },
    });

    try {
        const data = await ddb.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(data.Item || null),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

const updateUser = async (email, body) => {
    const { newName, newUsername, newPassword, newRole } = JSON.parse(body);
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { email },
        UpdateExpression:
            "set #name = :newName, #username = :newUsername, #password = :newPassword, #role = :newRole",
        ExpressionAttributeNames: {
            "#name": "name",
            "#username": "username",
            "#password": "password",
            "#role": "role",
        },
        ExpressionAttributeValues: {
            ":newName": newName,
            ":newUsername": newUsername,
            ":newPassword": newPassword,
            ":newRole": newRole,
        },
    });

    try {
        await ddb.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User updated successfully." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};

const deleteUser = async (email) => {
    if (!email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Email is required for deletion." }),
        };
    }

    const command = new DeleteCommand({
        TableName: USERS_TABLE,
        Key: { email },
    });

    try {
        await ddb.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "User deleted successfully." }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
