const express = require('express');
const cors = require('cors');
const { v4: uuidv4} = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(users => users.username === username);

  if(!user){
    return response.status(404).json({error: "O usuário é inexistente"});
  }
  request.user = user;
  return next();

}

app.post('/users', (request, response) => {
const {name, username} = request.body;
const userAccountExists = users.some(
  (users) => users.username === username);

  if(userAccountExists){
    return response.status(400).json({error: "Este nome de usuário já está em uso, tente outro."})
  };

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  return response.status(201).json(users);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const {user} = request;

  const todoBody = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todoBody);

  return response.status(201).json(todoBody)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const attTodo = user.todos.find(attTodo => attTodo.id === id);

  if(!attTodo){
    return response.status(404).json({error: 'Id não encontrado'});
  }
  attTodo.title = title;
  attTodo.deadline = new Date(deadline);

  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const {id} = request.params;

  const attTodoConcluded = user.todos.find((attTodoConcluded) => attTodoConcluded.id === id);

  if(attTodoConcluded){
    attTodoConcluded.done = true;
      return response.status(201).json({message:"Tarefa concluida com sucesso"});
  }
    return response.status(404).json({error: "Id não encontrado"});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const deleteTodo = user.todos.findIndex(todos => todos.id === id);

  if(deleteTodo === -1){
    return response.status(404).json({error:"Id não encontrado"});
  }
  user.todos.splice(deleteTodo, 1)

return response.status(404).json({message:"Deletado com sucesso"}).send()

});

module.exports = app;