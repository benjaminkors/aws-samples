const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    PutCommand,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const USERS_TABLE = "Users";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
const ddb = client;

// Controller Functions
exports.createUser = async (req, res) => {
    const { email, name, username, password, role } = req.body;
    const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: { email, name, username, password, role },
    });
    try {
        await ddb.send(command);
        res.json({ message: "User created successfully." });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    const command = new ScanCommand({
        TableName: USERS_TABLE,
    });
    try {
        const data = await ddb.send(command);
        res.json(data.Items || []);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.readUser = async (req, res) => {
    const { email } = req.query;
    const command = new GetCommand({
        TableName: USERS_TABLE,
        Key: { email },
    });
    try {
        const data = await ddb.send(command);
        res.json(data.Item || null);
    } catch (error) {
        console.error("Error reading user:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { email, newName, newUsername, newPassword, newRole } = req.body;
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
        res.json({ message: "User updated successfully." });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res
            .status(400)
            .json({ error: "Email is required for deletion." });
    }
    const command = new DeleteCommand({
        TableName: USERS_TABLE,
        Key: { email: email },
    });
    try {
        await ddb.send(command);
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: error.message });
    }
};
