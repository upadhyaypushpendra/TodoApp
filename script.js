/* Model class starts */
class Model {
    constructor() {
        this.todos= JSON.parse(localStorage.getItem('todoTasks'))|| [] ;
        this.activeNav = "1";
    }
    _commit(todos) {
        this.onTodoListChanged(this.getTodoTasks());
        this.onDoneListChanged(this.getDoneTasks());
        localStorage.setItem('todoTasks',JSON.stringify(todos));
    }
    getTodoTasks(){
        return this.todos.filter(todo=> !todo.complete);
    };
    getDoneTasks(){
        return this.todos.filter(todo=> todo.complete);
    };
    toggleNavigation(id){
        this.activeNav = id;
    };
    searchTodo(searchText){
        searchText = searchText.trim().toUpperCase();
        if(searchText.length === 0){
            this.onTodoListChanged(this.getTodoTasks());
            return;
        }
        let searchKeys = searchText.split(" ");
        let numberOfKeys = searchKeys.length;
        let text;

        let searchResult = this.todos.filter(todo=> {
            if(!todo.complete) return false;
            let hasKey = false;
            text = todo.text.toUpperCase();
            for(let i=0;i<numberOfKeys;i++){
                if(text.includes(searchKeys[i])) {
                    hasKey = true;
                    break;
                };
            }
            return hasKey;
        });
        this.activeNav ==="1" ? this.onTodoListChanged(searchResult) : this.onDoneListChanged(searchResult);
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
        this.onTodoListChanged(this.getTodoTasks());        
    }
    deleteTodo(id){
        this.todos= this.todos.filter((todo)=> todo.id !== id);
        this._commit(this.todos);
        this.onTodoListChanged(this.getTodoTasks());
        this.onDoneListChanged(this.getDoneTasks());

    }
    editTodo(id,updatedText){
        this.todos = this.todos.map((todo) =>
            todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo,
        )
        this._commit(this.todos);
        this.onTodoListChanged(this.getTodoTasks());
        this.onDoneListChanged(this.getDoneTasks());        
    }
    toggleTodo(id){
        this.todos = this.todos.map((todo) =>
            todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo,
        )
        this._commit(this.todos);
        this.onTodoListChanged(this.getTodoTasks());
        this.onDoneListChanged(this.getDoneTasks());
    }
    bindTodoListChanged(callback){
        this.onTodoListChanged = callback;
    }
    bindDoneListChanged(callback){
        this.onDoneListChanged = callback;
    }

}

/* Model class ends */
/* View class starts */
class View{
    constructor() {
        // The root Element
        this.app= this.getElement('#root');

        // Header container
        this.header = this.createElement('div',"row");

        //The title of the app
        this.title=this.createElement('h1');
        this.title.textContent='Todos';

        // search field
        this.searchInput = this.createElement('input',"search-input");
        this.searchInput.type='text';
        this.searchInput.placeholder = 'Search Todo....';
        this.searchInput.name = 'searchInput';

        // Append search input and title to the header
        this.header.append(this.title,this.searchInput);

        // Navigation Bar
        this.navigation = this.createElement('nav','row');

        // todo bar
        this.todoNav = this.createElement('div','nav-bar-active');
        this.todoNav.innerText = "Todo";
        this.todoNav.id = "1";

        // done bar
        this.doneNav = this.createElement('div');
        this.doneNav.innerText = "Done!";
        this.doneNav.id = "2";

        // Append nav bars to navigation
        this.navigation.append(this.todoNav,this.doneNav);

        // The form, with a [type="text"] input, and a submit button
        this.form = this.createElement('form');

        this.input=this.createElement('input');
        this.input.type='text';
        this.input.placeholder='Add todo';
        this.input.name='todo';

        this.submitButton =this.createElement('button');
        this.submitButton.textContent='Add';

        // The visual representation of todo-list
        //List container
        this.listContainer = this.createElement('div',"list-container");

        // todo tasks list
        this.todoList=this.createElement('ul','todo-list');

        // done task list
        this.doneList=this.createElement('ul','todo-list');
        this.doneList.style.display = 'none';

        // Append list to list container
        this.listContainer.append(this.todoList,this.doneList);

        //Append input and submit button to the form
        this.form.append(this.input,this.submitButton);

        // Append title, serach-input ,form and list container to the app
        this.app.append(this.header,this.navigation,this.form,this.listContainer);

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
    displayTodoTasks(todos){        
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
    displayDoneTasks(doneTasks){        
        // Delete all Nodes
        while(this.doneList.firstChild){
            this.doneList.removeChild(this.doneList.firstChild);
        }
        if(doneTasks.length == 0){
            const p=this.createElement('p');
            p.textContent='Nothing here !!'
            this.doneList.append(p);
        }else {
            doneTasks.forEach(task=>{
                const li = this.createElement('li');
                li.id=task.id;

                const  checkBox = this.createElement('input');
                checkBox.type='checkbox';
                checkBox.checked = task.complete;

                const  span = this.createElement('span','editable');
                span.contentEditable = true;

                if(task.complete){
                  const strike=this.createElement('s');
                  strike.textContent = task.text;
                  span.append(strike);
                } else{
                    span.textContent = task.text;
                }

                const deleteButton = this.createElement('button','delete');
                deleteButton.textContent = 'Delete';

                li.append(checkBox,span,deleteButton);

                this.doneList.append(li);
            });
        }
    }
    changeNavigation(id){
        if(id === "1") {
            this.todoList.style.display = "block";
            this.doneList.style.display = "none"
        } else {
            this.todoList.style.display = "none";
            this.doneList.style.display = "block"
        }
        if(id === "1") this.todoList.style.display = "block";
        this.navigation.childNodes.forEach(node=>{
            node.classList.remove("nav-bar-active");
            if(node.id === id )  node.classList.add("nav-bar-active");
        });
    };
    bindToggleNavigation(handler){
        this.todoNav.addEventListener('click',event=>{
            //handler(event.target.id);
            this.changeNavigation(event.target.id);
        });
        this.doneNav.addEventListener('click',event=>{
            //handler(event.target.id);
            this.changeNavigation(event.target.id);
        })
        
    };
    bindSearchTodo(handler){
        this.searchInput.addEventListener('input',event=>{
            handler(event.target.value);
        });
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
    createElement(tag,...classNames){
        const element=document.createElement(tag);
        if (classNames.length > 0) element.classList.add(...classNames);
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
        this.onTodoListChanged(this.model.getTodoTasks());
        this.onDoneListChanged(this.model.getDoneTasks());
        this.view.bindSearchTodo(this.handleSearchTodo);
        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.view.bindEditTodo(this.handleEditTodo);
        this.view.bindToggleNavigation(this.handleToggleNavigation);
        this.model.bindTodoListChanged(this.onTodoListChanged);
        this.model.bindDoneListChanged(this.onDoneListChanged);
    }
    handleToggleNavigation =(id)=>{
        this.model.toggleNavigation(id);
    };
    onDoneListChanged = (doneTasks)=> {
        this.view.displayDoneTasks(doneTasks);
    }
    onTodoListChanged = (todoTasks)=> {
        this.view.displayTodoTasks(todoTasks);
    }
    handleSearchTodo = (searchText) =>{
        this.model.searchTodo(searchText);
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