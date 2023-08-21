const { createTransport } = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const { GOOGLE_ID, GOOGLE_REFRESH, GOOGLE_SECRET, GOOGLE_URL, GOOGLE_USER, BACK_URL } = process.env

function createClient() {
    return new OAuth2(
        GOOGLE_ID,
        GOOGLE_SECRET,
        GOOGLE_URL
    )
}

function getTransport(client) {
    const accessToken = client.getAccessToken()
    return createTransport({
        service: 'gmail',
        auth: {
            user: GOOGLE_USER,
            type: 'OAuth2',
            clientId: GOOGLE_ID,
            clientSecret: GOOGLE_SECRET,
            refreshToken: GOOGLE_REFRESH,
            accessToken: accessToken
        },
        tls: { rejectUnauthorized: false }
    })
}

function getEmailBody({ mail, host, code, beforePassword }) {
    return `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; display: flex; justify-content: center;">
    <div style="border:1em solid black; padding: 2em; border-radius: 1em;">
        <div style="display: flex; justify-content: center;">
            <img src="https://i.ibb.co/8mcPd4t/banner.png" alt="banner" border="0" />
        </div>
        <div style="padding: 10px;">
            <h3>Hola <b style="color: gray;">${mail}</b></h3>
            <h2>Confirma tu dirección de correo electrónico</h2>
        </div>
        <div style="padding: 10px;">
            <p>
                Le damos la bienvenida a <b>SID</b>. Para completar tu registro, haz clic en el siguiente enlace:
            </p>
            <div style="background-color: orange;width: 150px; height: 40px;border-radius: 5px;text-align: center; display: flex; justify-content: center;">
                <a href="${host}/auth/verify/${code}" style="text-decoration: none; color: black; margin: auto;">
                    Verifica tu email
                </a>
            </div>
        </div>
        <div style="padding: 10px;">
            <p>
                Si no puedes hacer clic en el enlace, copia y pega la siguiente dirección en tu navegador: <i
                    style="color: rgb(0, 255, 21);">${host}/auth/verify/${code}</i>
            </p>
            <p>
                Te dejamos tus datos de acceso: <br>
                <b>Usuario:</b> ${mail} <br>
                <b>Contraseña:</b> ${beforePassword}
            </p>
            <p>
                Guarda esta información en un lugar seguro. La necesitarás para iniciar sesión en <b>SID</b>.
            </p>
        </div>
        <div style="padding: 10px;">
            <p>
                Si no has creado una cuenta en <b>SID</b>, ignora este mensaje.
            </p>
        </div>
    </div>
</div>
    `
}

const accountVerificationEmail = async (mail, code, beforePassword) => {
    const client = createClient()
    client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH })
    const transport = getTransport(client)
    const mailOptions = {
        from: GOOGLE_USER,
        to: mail,
        subject: 'Verifica tu cuenta en SID',
        html: getEmailBody({ mail, host: BACK_URL, code, beforePassword})
    }
    await transport.sendMail(mailOptions, (error, response) => {
        if (error) {
            console.error(error)
            return
        }
        console.log('Email sent!')
    })
}

module.exports = accountVerificationEmail