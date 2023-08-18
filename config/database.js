const mongoose = require('mongoose');

let conection = async () => {
    try {
        mongoose.connect(
            process.env.DB_HOST,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
        console.log('Conectado a la base de datos')
    } catch (error) {
        console.log('Error');
    }
}

conection();