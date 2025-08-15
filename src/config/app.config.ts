export default () => ({
    // APP Details
    app : {
        name:process.env.APP_NAME,
        description:process.env.APP_DESCRIPTION,
        backEndUrl:process.env.BACKEND_URL
    },

    // REDIS
    redis:{
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT,
        password:process.env.REDIS_PASSWORD
    },

    // Mail
    mail:{
        from:process.env.EMAIL_FROM,
        host:process.env.EMAIL_HOST,
        port:process.env.EMAIL_PORT,
        username:process.env.EMAIL_USERNAME,
        password:process.env.EMAIL_PASSWORD
    },

    jwt:{
        secret: process.env.JWT_SECRET,
        expiry: process.env.JWT_EXPIRY
    },

    storageUrl:{
        rootUrl: './public/storage',
        rootUrlPublic: '/public/storage',
        avatar: '/avatar',
        videos: '/videos',
        pictures: '/pictures'
    }
})