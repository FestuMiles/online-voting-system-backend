import User from '../models/user.js';

// Controller to retrieve all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving users', error });
    }
};

//retrieving the total number of users
const getTotalNumberOfUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        console.log("Total number of users:", totalUsers);
        res.status(200).json({ totalUsers });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving total number of users', error });
    }
};

export default getAllUsers;


//Deleting a user
const deleteUser = async (req, res)=>{
    try {
        const userId = req.params.id;
        console.log("Deleting user with ID:", userId);
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log("Error deleting user:", error);
        res.status(500).json({ message: 'Error deleting user', error });
    }
}

export { deleteUser, getTotalNumberOfUsers };