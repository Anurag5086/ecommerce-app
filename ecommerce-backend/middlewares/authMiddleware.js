const jwt = require("jsonwebtoken")

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization // Bearer <token>

    if(!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized! Faulty token provided!" })
    }

    const token = authHeader.split(" ")[1] // Extract the token part

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // Verify the token and decode the payload 
        req.user = decoded // Attach the decoded user info to the request object for use in controllers
        next() // Proceed to the next middleware or route handler
    }catch(err){
        return res.status(401).json({ message: "Unauthorized! Invalid token!" })
    }
}