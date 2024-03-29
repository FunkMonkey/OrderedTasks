
function log(str)
{
	if(console)
		console.log(str);
}

var TaskManager = {
	
	init: function init()
	{
		this.$tasks = $("#tasks");
		
		this.rootTask = new Task("root");
		this.unsaved = false;
		
	},
	
	createTaskList: function createTaskList()
	{
		this.$tasks.empty();
		
		var $taskList = $(document.createElement("ol"));
		this.$tasks.append($taskList);
		
		for (var i=0; i < this.rootTask.subTasks.length; i++) {
			this.createSubTaskList($taskList, this.rootTask.subTasks[i], 1);
		}
	},
	
	/**
	 * Called when hovering over a list-item
	 * 
	 * @param   {DOMEvent}   event   
	 */
	onListItemHover: function onListItemHover(event)
	{
		event.stopPropagation();
		
		var coords = $(event.target).offset();
		coords.left -= 20;
		this.showTaskTools(coords);
	},
	
	/**
	 * Shows the task-tools-box
	 */
	showTaskTools: function showTaskTools(coords)
	{
		$("#taskTools").show();
		$("#taskTools").offset(coords);
	}, 
	
	
	createSubTaskList: function createSubTaskList($parent, task, level)
	{
		var $LI = $(document.createElement("li"));
		$LI.text(task.name);
		$LI.mouseenter(this.onListItemHover.bind(this));
		$LI[0].task = task;
		if(task.finished)
			$LI.attr("finished", task.finished);
			
		$parent.append($LI);
		
		if(task.subTasks.length !== 0)
		{
			var $subTasksList = $(document.createElement("ol"));
			$LI.append($subTasksList);
			for (var i=0; i < task.subTasks.length; i++) {
				this.createSubTaskList($subTasksList, task.subTasks[i], level + 1);
			}
		}
	},
	
	taskListToJSON: function taskListToJSON()
	{
		return this.rootTask.getSaveJSON();
	},
	
	createTaskListFromJSON: function createTaskListFromJSON(json)
	{
		this.rootTask = Task.createFromJSON(json);
	},
	
	
	
	refresh: function refresh()
	{
		this.createTaskList();
		
	},
	
	loadFromData: function loadFromData(data)
	{
		this.createTaskListFromJSON(data.tasks);
		
		TaskManager.refresh();
	},
	
	getSavableData: function getSavableData()
	{
		var data = {};
		data.tasks = this.taskListToJSON();
		
		return data;
	},
	
	save: function save()
	{
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var localPath = FileIO.getFileFromURI(document.location.toString());
		var dataJSON = localPath.parent;
		dataJSON.append("data.json");
		
		var data = "var data = " + JSON.stringify(this.getSavableData());
		
		FileIO.saveFile(dataJSON.path, data);
		
		this.unsaved = false;
	},
	
	showNewTaskDialog: function showNewTaskDialog(parentTask)
	{
		this.newTaskParent = (parentTask == null) ? this.rootTask : parentTask;
		
		$("#newTask_Name").val("");
		$("#newTaskDialog").show();
	},
	
	hideNewTaskDialog: function hideNewTaskDialog()
	{
		$("#newTaskDialog").hide();
	},
	
	
	createNewTask: function createNewTask()
	{
		this.newTaskParent.addSubTask(new Task($("#newTask_Name").val()))
		this.hideNewTaskDialog();
		this.refresh();
		this.unsaved = true;
	},
	
	
	
	
};

function onReady()
{
	TaskManager.init();
	//TaskManager.save();
	if(typeof(data) !== "undefined")
		TaskManager.loadFromData(data);
}

$("window").ready(onReady);

window.onbeforeunload = function onbeforeunload()
{
	if(TaskManager.unsaved)
		return "There is unsaved data. Do yo really want to leave?";
}