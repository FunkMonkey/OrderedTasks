function Task(name)
{
	this.parent = null;
	this.name = name;
	this.subTasks = [];
	this._finished = false;
}

Task.prototype = {
	constructor: Task,
	
	addSubTask: function addSubTask(task)
	{
		if(task.parent === this)
			return;
		
		task.parent = this;
		this.subTasks.push(task);
		
		// update finished status
		this.finished = false;
	},
	
	get finished()
	{
		return this._finished;
	},
	
	set finished(val)
	{
		if(this.subTasks.length === 0)
		{
			this._finished = val;
			if(this.parent)
				this.parent.finished = val; // will check anyway, so its safe
		}
		else
		{
			// check all children
			var subAllFinished = true;
			for (var i=0; i < this.subTasks.length; i++)
			{
				if(!this.subTasks[i].finished)
				{
					subAllFinished = false;
					break;
				}
			}
			
			this._finished = subAllFinished;
			if(this.parent)
				this.parent.finished = subAllFinished; // will check anyway, so its safe
		}
	},
	
	getSaveJSON: function getSaveJSON()
	{
		var obj = {};
		obj.name = this.name;
		obj.finished = this.finished;
		obj.subTasks = [];
		
		for (var i=0; i < this.subTasks.length; i++)
			obj.subTasks.push(this.subTasks[i].getSaveJSON());
			
		return obj;
	},
	
}

Task.createFromJSON = function createFromJSON(json)
{
	var task = new Task(json.name);
	task.finished = json.finished;
	for (var i=0; i < json.subTasks.length; i++) {
		task.addSubTask(Task.createFromJSON(json.subTasks[i]));
	}
	return task;
}
