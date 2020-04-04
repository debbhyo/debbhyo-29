import axios from '../axios'

const getIdentity = () => new Promise((resolve, reject) => {
    axios.get('/get-identity',{withCredentials: true})
    .then(res =>  {
        resolve(res.data)
    })
    .catch(err => {
        reject(err)
    })
});

const login = (username, table) => new Promise((resolve, reject) => {
    axios.post('/login',{username:username, table:table},{withCredentials: true})
    .then(res =>  {
        resolve(res.data)
    })
    .catch(err => {
        reject(err)
    })
});

export default {
    getIdentity,
    login
}