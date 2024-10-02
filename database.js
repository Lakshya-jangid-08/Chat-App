const mongoose = require('mongoose');
mongoose.connect(`mongodb://127.0.0.1:27017/let_code`);

let user_info = mongoose.Schema({
    User : String,
    Email : String,
    Password : String,
    Url : String,
})

module.exports = mongoose.model('user',user_info);

/*async function clearCollection() {
    try {
        await mongoose.connection.dropCollection('users');
        console.log('All data removed from the collection.');
    } catch (error) {
        console.error('Error removing data:', error);
    } finally {
        mongoose.connection.close();
    }
}

clearCollection(); */