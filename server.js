const Fastify = require('fastify')

const fastify = Fastify({
    logger: false
})

const fastifyCors = require('fastify-cors');

const { Database, getWallet } = require('./function');

const db = new Database();

fastify.post('/topup', async (req, reply) => {
    const body = req.body;
    const query = req.query;

    const reg = await db.register(body.username, body.password);

    if (reg == 404) {
        reply.send({
            status: 404,
            code: "NOT_FOUND_USER",
            message: "ไม่พบผู้ใช้"
        })
    } else {
        if (reg == true) {
            const topup = await getWallet(query.code, body.phonenumber);

            if (topup.status == 200) {
                reply.send({
                    status: 200,
                    code: "SUCCESS",
                    message: "ทำรายการสำเร็จ",
                    detail: topup
                })
            } else if (topup.status == 401) {
                reply.send({
                    status: 401,
                    code: "FOUND_GIFT_NO_SUCCESS",
                    message: "เจอวองของขวัญแต่ไม่สามารถตัดบัตรได้เนื่องจากมีบางอย่างผิดพลาด",
                    detail: topup
                })
            } else {
                reply.send({
                    status: 400,
                    code: "USER_ERROR",
                    message: "ข้อผิดพลาดที่ไม่สามารถอธิบายได้",
                    detail: topup
                })
            }
        } else {
            reply.send({
                status: 400,
                code: "UNABLE_VERTIFY",
                message: "ไม่สามารถยืนยันตัวตนได้"
            })
        }
    }
})

// User Function
fastify.post("/user/reg", async (req, reply) => {
    try {
        const body = req.body;
        const setData = await db.newUser(body.username, body);

        if (setData == 400) {
            reply.send({
                status: 400,
                code: "INCOMPLETE_INFOMATION",
                message: "ข้อมูลไม่ครบ"
            })
        } else if (setData == 500) {
            reply.send({
                status: 500,
                code: "SERVER_HAS_ERROR",
                message: "มีข้อผิดพลาดทาง Server"
            })
        } else if (setData == 450) {
            reply.send({
                status: 400,
                code: "USERNAME_HAVE",
                message: "มีชื่อผู้ใช้: " + body.username + " แล้ว"
            })
        } else {
            reply.send({
                status: 200,
                code: "SUCCESS",
                message: "สำเร็จ"
            })
        }
    } catch {
        reply.send({
            status: 500,
            code: "SERVER_HAS_ERROR",
            message: "มีข้อผิดพลาดทาง Server"
        })
    }
})

fastify.get("/user/get", async (req, reply) => {
    const query = req.query.u;

    const data = await db.getUser(query);


    if (data == 404) {
        reply.send({
            status: 404,
            code: "NOT_FOUND_USER",
            message: "ไม่พบผู้ใช้"
        })
    } else if (data == 500) {
        reply.send({
            status: 500,
            code: "SERVER_HAS_ERROR",
            message: "มีข้อผิดพลาดทาง Server"
        })
    } else {
        reply.send({
            status: 200,
            code: "SUCCESS",
            message: "สำเร็จ",
            data: data
        })
    }
});


const server = async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

server();