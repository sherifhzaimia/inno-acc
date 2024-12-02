require('dotenv').config();

const authConfig = {
    creativsea: {
        loginUrl: "https://creativsea.com/my-account/",
        credentials: {
            email: process.env.CREATIVSEA_EMAIL,
            password: process.env.CREATIVSEA_PASSWORD
        },
        selectors: {
            username: "#username",
            password: "#password",
            loginButton: 'button[name="login"]'
        },
        sessionCookie: "wordpress_logged_in_69f5389998994e48cb1f2b3bcad30e49"
    },
    designbeast: {
        loginUrl: "https://designbeastapp.com/Dashboard/Account/Login",
        credentials: {
            email: process.env.DESIGNBEAST_EMAIL,
            password: process.env.DESIGNBEAST_PASSWORD
        },
        selectors: {
            username: 'input[name="EmailId"]',
            password: 'input[name="Password"]',
            loginButton: 'button[type="submit"]'
        },
        sessionCookie: "ASP.NET_SessionId"
    },
    peeksta: {
        loginUrl: "https://auth2.peeksta.com/u/login?state=hKFo2SBSMlVLcFNkZjhfcHR6SGhKUXk2ekdZemdhNEpEcVhOUKFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIEREU1dFMmQtYm1oQ1ZBYjl0SndlSW5rTFEzcVhkSmJEo2NpZNkgUUJ1RlNvam1ic1R6V3pKZ0w5c0k2dDVJcjhlZzdpRDQ",
        credentials: {
            email: process.env.PEEKSTA_EMAIL,
            password: process.env.PEEKSTA_PASSWORD
        },
        selectors: {
            username: 'input#username',
            password: 'input#password',
            loginButton: 'button[type="submit"]'
        },
        sessionCookie: "appSession"
    },
    winninghunter: {
        loginUrl: "https://app.winninghunter.com/login",
        credentials: {
            email: process.env.WINNINGHUNTER_EMAIL,
            password: process.env.WINNINGHUNTER_PASSWORD
        },
        selectors: {
            username: '#Email-2',
            password: '#Password',
            loginButton: 'button[type="submit"]'
        },
        sessionCookie: "remember_me"
    },
    academun: {
        loginUrl: "https://academun.com/dashboard/",
        credentials: {
            email: process.env.ACADEMUN_EMAIL,
            password: process.env.ACADEMUN_PASSWORD
        },
        selectors: {
            username: 'input[name="log"]',
            password: 'input[name="pwd"]',
            loginButton: '#tutor-login-form > button'
        },
        sessionCookie: "wordpress_logged_in_ada51868a6667b3f41712245b62dfcd7"
    }
    // يمكن إضافة مواقع أخرى هنا في المستقبل
};

module.exports = authConfig;
