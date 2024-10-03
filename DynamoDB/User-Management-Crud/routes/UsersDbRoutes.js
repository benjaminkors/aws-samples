const express = require("express");
const userController = require("../controllers/UsersDbController");

const router = express.Router();

router.post("/create", userController.createUser);
router.get("/users", userController.getUsers);
router.get("/read", userController.readUser);
router.put("/update", userController.updateUser);
router.delete("/delete", userController.deleteUser);

module.exports = router;
