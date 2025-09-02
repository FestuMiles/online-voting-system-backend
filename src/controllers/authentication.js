import User from '../models/user.js';
import bcrypt from 'bcrypt';

// Controller function to handle user registration
export const registerUser = async (req, res) => {

    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            studentId,
            school,
            yearOfStudy,
            department,
            password,
            agreeTerms
        } = req.body;
        // Basic validation
        
        if (!firstName || !lastName || !email || !password || !agreeTerms) {
            return res.status(400).json({ message: 'Please fill in all required fields and agree to terms.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        if (agreeTerms !== 'on' && agreeTerms !== true) {
            return res.status(400).json({ message: 'You must agree to the terms and conditions.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            studentId,
            school,
            yearOfStudy,
            department,
            password: hashedPassword,
            agreeTerms: (agreeTerms === 'on' || agreeTerms === true),
            isAdmin: false
        });

        // Save user to database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


// Controller function to handle user login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        // Compare provided password with hashed password in database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        //Add data to user session
        req.session.userId = user._id;
        req.session.userEmail = user.email;
        req.session.firstName = user.firstName;
        req.session.lastName = user.lastName;
        req.session.isLoggedIn = true;
        req.session.isAdmin = user.isAdmin;


        // Successful login
        res.status(200).json({ message: 'Login successful.', user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}


export const logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Server error. Please try again later.' });
        }
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.status(200).json({ message: 'Logout successful.' });
    });
};

