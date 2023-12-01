const { initializeApp } = require('firebase/app');
const { getDatabase, get, ref, update, remove, push, set } = require('firebase/database');
const md5 = require('md5');
const twApi = require('@opecgame/twapi');

async function getWallet(code, phone_number) {
    const tw = await twApi(code, phone_number)
    switch (tw.status.code) {
        case "SUCCESS":
            return {
                status: 200,
                code: "success",
                message: "สำเร็จ",
                data: {
                    link: tw.data.voucher.link,
                    amount: tw.data.voucher.amount_baht,
                    owner: tw.data.owner_profile.full_name
                }
            }
        case "CANNOT_GET_OWN_VOUCHER":
            return {
                status: 400,
                code: "cannot_get_own_voucher",
                message: "ไม่สามารถรับซองของขวัญของตัวเองได้"
            }
        case "TARGET_USER_NOT_FOUND":
            return {
                status: 400,
                code: "target_user_not_found",
                message: "ไม่พบเบอร์นี้ในระบบ"
            }
        case "INTERNAL_ERROR":
            return {
                status: 400,
                code: "internal_error",
                message: "ไม่ซองนี้ในระบบ หรือ URL ผิด"
            }
        case "VOUCHER_OUT_OF_STOCK":
            return {
                status: 401,
                code: "voucher_out_of_stock",
                message: "มีคนรับไปแล้ว",
                data: {
                    link: tw.data.voucher.link,
                    amount: tw.data.voucher.amount_baht,
                    owner: tw.data.owner_profile.full_name
                }
            }
        case "VOUCHER_NOT_FOUND":
            return {
                status: 400,
                code: "voucher_not_found",
                message: "ไม่พบซองในระบบ"
            }
        case "VOUCHER_EXPIRED":
            return {
                status: 401,
                code: "voucher_expired",
                message: "ซองวอเลทนี้หมดอายุแล้ว",
                data: {
                    link: tw.data.voucher.link,
                    amount: tw.data.voucher.amount_baht,
                    owner: tw.data.owner_profile.full_name
                }
            }
        default:
            break;
    }
}


const app = initializeApp({
    apiKey: "AIzaSyA8F9aUQH3bmplKRi2sP7z8BzxJ7MBFiEo",
    authDomain: "api-project-d.firebaseapp.com",
    databaseURL: "https://api-project-d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "api-project-d",
    storageBucket: "api-project-d.appspot.com",
    messagingSenderId: "512818913786",
    appId: "1:512818913786:web:56f4def1c328ca4aa78443",
    measurementId: "G-XVBGQJ7WL3"
})
const db = getDatabase(app);

class Database {
    getUserHave(username) {
        return new Promise((resolve, reject) => {
            try {
                const refer = ref(db, "/users/" + username);

                get(refer).then(result => {
                    const data = result.val();
                    if (data == null) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
            } catch {
                resolve(500)
            }
        })
    }

    newUser(username, data) {
        return new Promise((resolve, reject) => {
            try {
                const refer = ref(db, "/users/" + username)
                this.getUserHave(username).then(r => {
                    if (r == 500) {
                        resolve(500)
                    } else if (r == true) {
                        const newData = {
                            username: data.username,
                            password: md5("P" + data.password),
                            request: 0
                        };

                        if (newData.username == "" || newData.username == null) {
                            resolve(400);
                        } else if (newData.password == "" || newData.password == null) {
                            resolve(400);
                        } else {
                            set(refer, newData).then(() => {
                                resolve(200);
                            }).catch(() => {
                                resolve(500);
                            })
                        }
                    } else {
                        resolve(450)
                    }
                })
            } catch
            {
                resolve(500)
            }
        })
    }

    getUser(username) {
        return new Promise((resolve, reject) => {
            get(ref(db, "/users/" + username)).then(r => {
                const data = r.val();

                if (data == null) {
                    resolve(404);
                } else {
                    resolve(data);
                }
            })

        })
    }

    register(username, password) {
        return new Promise((resolve, reject) => {
            this.getUser(username).then(r => {
                if (r == 404) {
                    resolve(404)
                }else{
                    if(md5(password) == data.password){
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                }
            }).catch(() => {
                resolve(500)
            })
        })
    }
}

module.exports = {
    Database,
    getWallet
}