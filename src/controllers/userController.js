// const userService = require('../services/userService');

// class UserController {
//     async register(req, res) {
//         try {
//             const user = await userService.register(req.body);
//             res.status(201).json(user);
//         } catch (error) {
//             res.status(400).json({ error: error.message });
//         }
//     }

//     async login(req, res) {
//         try {
//             const user = await userService.login(req.body.email, req.body.password);
//             res.status(200).json(user);
//         } catch (error) {
//             res.status(400).json({ error: error.message });
//         }
//     }

    
// }


// const changePassword(req, res) {
//     try {
//         await userService.changePassword(req.user.id, req.body.newPassword);
//         res.status(200).json({ message: 'Password changed successfully' });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// }

// module.exports = new UserController();
