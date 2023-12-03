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


const server = async () => {
    try {
        await fastify.listen({ port: 3000 })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

server();