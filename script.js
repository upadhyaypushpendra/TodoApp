/* Model class starts */
class Model {
    constructor() {
        this.todos= JSON.parse(localStorage.getItem('todos'))|| [] ;
    }
    _commit(todos) {
        //let completed = this.todos.filter(todo=> todo.complete);
        todos.sort(todo=> todo.complete ? 1 : -1);
        this.onTodoListChanged(todos);
        localStorage.setItem('todos',JSON.stringify(todos));
    }
    addTodo(todoText) {
        const len=this.todos.length;
        const todo={
            id :    Date.now(),
            text : todoText,
            complete : false
        }
        this.todos.push(todo);
        this._commit(this.todos);
        this.onTodoListChanged(this.todos);
    }
    deleteTodo(id){
        this.todos= this.todos.filter((todo)=> todo.id !== id);
        this._commit(this.todos);
        this.onTodoListChanged(this.todos);
    }
    editTodo(id,updatedText){
        this.todos = this.todos.map((todo) =>
            todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo,
        )
        this._commit(this.todos);
        this.onTodoListChanged(this.todos);
    }
    toggleTodo(id){
        this.todos = this.todos.map((todo) =>
            todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo,
        )
        this._commit(this.todos);
        this.onTodoListChanged(this.todos);
    }
    bindTodoListChanged(callback){
        this.onTodoListChanged = callback;
    }

}

/* Model class ends */
/* View class starts */
class View{
    constructor() {
        // The root Element
        this.app= this.getElement('#root');

        //The title of the app
        this.title=this.createElement('h1');
        this.title.textContent='Todos';

        // search field
        this.searchInput = this.createElement('input');
        this.searchInput.type='text';
        this.searchInput.placeholder = 'Search Todo....';
        this.searchInput.name = 'searchInput';

        // The form, with a [type="text"] input, and a submit button
        this.form = this.createElement('form');

        this.input=this.createElement('input');
        this.input.type='text';
        this.input.placeholder='Add todo';
        this.input.name='todo';

        this.submitButton =this.createElement('button');
        this.submitButton.textContent='Add';

        // The visual representation of todo-list
        this.todoList=this.createElement('ul','todo-list');

        //Append input and submit button to the form
        this.form.append(this.input,this.submitButton);

        // Append title form and todo-list to the app
        this.app.append(this.title,this.searchInput,this.form,this.todoList);

        this._tempTodoText='';
        this._initLocalListeners();
    }
    _initLocalListeners(){
        this.todoList.addEventListener('input',event =>{
            if(event.target.className=='editable'){
                this._tempTodoText=event.target.innerText;
            }
        });
    }
    get _todoText(){
        return this.input.value;
    }
    _resetInput(){
        this.input.value = '';
    }
    displayTodos(todos){
        // Delete all Nodes
        while(this.todoList.firstChild){
            this.todoList.removeChild(this.todoList.firstChild);
        }
        if(todos.length == 0){
            const p=this.createElement('p');
            p.textContent='Nothing to do ! Add a task ?'
            this.todoList.append(p);
        }else {
            todos.forEach(todo=>{
                const li = this.createElement('li');
                li.id=todo.id;

                const  checkBox = this.createElement('input');
                checkBox.type='checkbox';
                checkBox.checked = todo.complete;

                const  span = this.createElement('span','editable');
                span.contentEditable = true;

                if(todo.complete){
                  const strike=this.createElement('s');
                  strike.textContent = todo.text;
                  span.append(strike);
                } else{
                    span.textContent = todo.text;
                }

                const deleteButton = this.createElement('button','delete');
                deleteButton.textContent = 'Delete';

                li.append(checkBox,span,deleteButton);

                this.todoList.append(li);
            })
        }


    }
    bindAddTodo(handler){
        this.form.addEventListener('submit',event =>{
            event.preventDefault();

            if(this._todoText){
                handler(this._todoText);
                this._resetInput();
            }
        })
    }
    bindEditTodo(handler){
        this.todoList.addEventListener('focusout',event =>{
            if(this._tempTodoText){
                const  id= parseInt(event.target.parentElement.id);
                handler(id,this._tempTodoText);
                this._tempTodoText='';
            }
        })
    }
    bindDeleteTodo(handler){
        this.todoList.addEventListener('click',event =>{
            if(event.target.className== 'delete'){
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }
    bindToggleTodo(handler){
        this.todoList.addEventListener('click',event =>{
            if(event.target.type== 'checkbox'){
                const id = parseInt(event.target.parentElement.id);
                handler(id);
            }
        });
    }
    createElement(tag,className){
        const element=document.createElement(tag);
        if (className) element.classList.add(className);
        return element;
    }
    getElement(selector){
        const element=document.querySelector(selector);
        return element;
    }
}
/* View class ends */
/* Controller class starts */
class Controller{
    constructor(model,view) {
        this.model=model;
        this.view=view;
        this.onTodoListChanged(this.model.todos);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
         this.view.bindEditTodo(this.handleEditTodo);
        this.model.bindTodoListChanged(this.onTodoListChanged);
    }
    onTodoListChanged = (todos)=> {
        this.view.displayTodos(todos);
    }
    handleAddTodo = (todoText) =>{
        this.model.addTodo(todoText);
    }
    handleDeleteTodo = (id) =>{
        this.model.deleteTodo(id);
    }
    handleEditTodo = (id,todoText) =>{
        this.model.editTodo(id,todoText);
    }
    handleToggleTodo = (id) =>{
        this.model.toggleTodo(id);
    }
}
/* Controller class ends */
const app = new Controller(new Model(),new View());