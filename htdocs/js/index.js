require('./base-css.js');
require('../css/menu.css');
require('../css/index.css');
var $ = window.jQuery = require('jquery'); //for bootstrap
require('bootstrap/dist/js/bootstrap.js');
var React = require('react');
var ReactDOM = require('react-dom');
var List = require('./list');
var ListModal = require('./list-modal');
var MenuItem = require('./menu-item');
var EditorSettings = require('./editor-settings');
var util = require('./util');
var dataCenter = require('./data-center');

var Index = React.createClass({
	getInitialState: function() {
		var data = this.props.data;
		var modal = {
				list: [],
				data: {}
		};
		var hasActive;
		data.list.forEach(function(item) {
			modal.list.push(item.name);
			
			var active = item.name == data.activeName;
			if (active) {
				hasActive = true;
			}
			modal.data[item.name] = {
					name: item.name,
					type: item.type,
					value: item.value,
					active: active
			};
		});
		
		if (!hasActive && (item = data.list[0])) {
			modal.data[item.name].active = true;
		}
		
		return {
			modal: new ListModal(modal.list, modal.data),
			engineList: data.engineList,
			theme: data.theme,
			fontSize: data.fontSize,
			showLineNumbers: data.showLineNumbers
		};
	},
	active: function(options) {
		dataCenter.setActive({activeName: options.name});
		this.setState({});
	},
	add: function(e) {
		var self = this;
		if (self._creating || !self.isEnterPressed(e)) {
			return;
		}
		
		var dialog = $(ReactDOM.findDOMNode(this.refs.createTpl));
		var input = dialog.find('.w-tpl-name');
		
		if (!self._checkTplName(input)) {
			return;
		}
		var name = $.trim(input.val());
		var modal = self.state.modal;
		if (modal.exists(name)) {
			alert('`' + name + '` already exists');
			input.select().focus();
			return;
		}
		var typeBox = dialog.find('.w-template-type');
		var type = typeBox.find('input:checked').attr('data-type') || 'default';
		self._creating = true;
		dataCenter.add({
			name: name,
			type: type
		}, function(data) {
			self._creating = false;
			if (!data || data.ec !== 0) {
				util.showSystemError();
				return;
			}
			input.val('');
			var item = modal.add(name, '');
			if (item) {
				item.type = type;
				modal.setActive(item.name);
				self.active(item);
			}
			dialog.modal('hide');
			self.setState({});
		});
	},
	setValue: function(item) {
		var self = this;
		if (!item.changed) {
			self.showEditDialog();
			return;
		}
		var modal = self.state.modal;
		dataCenter.setValue(item, function(data) {
			if (!data || data.ec !== 0) {
				util.showSystemError();
				return;
			}
			
			modal.setChanged(item.name, false);
			self.setState({});
		});
	},
	save: function() {
		this.state.modal
				.getChangedList()
					.forEach(this.setValue);
	},
	showEditDialog: function() {
		var activeItem = this.state.modal.getActive();
		if (activeItem) {
			this._showTplDialog($(ReactDOM.findDOMNode(this.refs.editTpl)), activeItem);
		}
	},
	edit: function(e) {
		var self = this;
		if (self._editing || !self.isEnterPressed(e)) {
			return;
		}
		var modal = self.state.modal;
		var activeItem = modal.getActive();
		if (!activeItem) {
			return;
		}
		var dialog = $(ReactDOM.findDOMNode(this.refs.editTpl));
		var input = dialog.find('.w-tpl-name');
		
		if (!self._checkTplName(input)) {
			return;
		}
		var name = $.trim(input.val());
		if (modal.exists(name) && activeItem.name != name) {
			alert('`' + name + '` already exists');
			input.select().focus();
			return;
		}
		
		var typeBox = dialog.find('.w-template-type');
		var type = typeBox.find('input:checked').attr('data-type') || 'default';
		self._editing = true;
		dataCenter.edit({
			name: activeItem.name,
			type: activeItem.type,
			newName: name,
			newType: type
		}, function(data) {
			self._editing = false;
			if (!data || data.ec !== 0) {
				util.showSystemError();
				return;
			}
			input.val('');
			activeItem.type = type;
			modal.rename(activeItem.name, name);
			dialog.modal('hide');
			self.setState({});
		});
	},
	isEnterPressed: function(e) {
		
		return e.type != 'keydown' || e.keyCode == 13;
	},
	convertName: function(name) {
		if (!name) {
			return '';
		}
		
		return name.trim().replace(/[^\w.\-]+/g, '').substring(0, 64);
	},
	_checkTplName: function(input) {
		var rawName = input.val().trim();
		var name = this.convertName(rawName);
		if (name != rawName) {
			input.val(name);
		}
		
		if (!name) {
			alert('Name cannot be empty');
			input.select().focus();
			return false;
		}
		
		return true;
	},
	_showTplDialog: function(dialog, data) {
		var typeBox = dialog.find('.w-template-type');
		var boxes = typeBox.find('input:checked');
		var nameInput = dialog.find('.w-tpl-name');
		if (data) {
			typeBox.find('input[data-type=' + data.type + ']').prop('checked', true);
			dialog.find('.w-tpl-name').val(data.name);
		} else if (!boxes.length) {
			typeBox.find('input:first').prop('checked', true);
		}
		dialog.modal('show');
		setTimeout(function() {
			nameInput.select().focus();
		}, 300);
	},
	showTplSettingsDialog: function() {
		$(ReactDOM.findDOMNode(this.refs.tplSettingsDialog)).modal('show');
	},
	remove: function() {
		var self = this;
		var modal = self.state.modal;
		var data = modal.getActive();
		if (!data || !confirm('Confirm delete `' + data.name + '`?')) {
			return;
		}
		
		dataCenter.remove(data, function(result) {
			if (!result || result.ec !== 0) {
				util.showSystemError();
				return;
			}
			var next = modal.getSibling(data.name);
			modal.remove(data.name);
			if (next) {
				modal.setActive(next.name, true);
				self.active(next);
			}
			self.setState({});
		});
	},
	showCreateTplDialog: function() {
		this._showTplDialog($(ReactDOM.findDOMNode(this.refs.createTpl)));
	},
	onThemeChange: function(e) {
		var theme = e.target.value;
		dataCenter.setTheme({theme: theme});
		this.setState({
			theme: theme
		});
	},
	onFontSizeChange: function(e) {
		var fontSize = e.target.value;
		dataCenter.setFontSize({fontSize: fontSize});
		this.setState({
			fontSize: fontSize
		});
	},
	onLineNumberChange: function(e) {
		var showLineNumbers = e.target.checked;
		dataCenter.showLineNumbers({showLineNumbers: showLineNumbers ? 1 : 0});
		this.setState({
			showLineNumbers: showLineNumbers
		});
	},
	render: function() {
		var state = this.state;
		var theme = state.theme || 'cobalt';
		var fontSize = state.fontSize || '14px';
		var showLineNumbers = state.showLineNumbers || false;
		var activeItem = this.state.modal.getActive();
		var engineName;
		if (activeItem) {
			engineName = <span className="w-engine-name">Engine(<a href={'https://github.com/whistle-plugins/whistle.vase#' + activeItem.type.toLowerCase()} target="_blank">{activeItem.type}</a>)</span>;
		}
		
		return (<div className="container orient-vertical-box">
					<div className="w-menu">
						<a className="w-create-menu" href="javascript:;" onClick={this.showCreateTplDialog}><span className="glyphicon glyphicon-plus"></span>Create</a>
						<a className="w-edit-menu" href="javascript:;" onClick={this.showEditDialog}><span className="glyphicon glyphicon-edit"></span>Edit</a>
						<a className="w-remove-menu" href="javascript:;" onClick={this.remove}><span className="glyphicon glyphicon-trash"></span>Delete</a>
						<a className="w-save-menu" href="javascript:;" onClick={this.save}><span className="glyphicon glyphicon-save-file"></span>Save</a>
						<a className="w-settings-menu" href="javascript:;" onClick={this.showTplSettingsDialog}><span className="glyphicon glyphicon-cog"></span>Settings</a>
						<a className="w-help-menu" href="https://github.com/whistle-plugins/whistle.vase#whistlevase" target="_blank"><span className="glyphicon glyphicon-question-sign"></span>Help</a>
						{engineName}
					</div>
					<List onActive={this.active} theme={theme} fontSize={fontSize} lineNumbers={showLineNumbers} onSelect={this.setValue}  modal={this.state.modal} className="w-data-list" />
					<div ref="createTpl" className="modal fade w-create-tpl">
						<div className="modal-dialog"> 
					  		<div className="modal-content">
						      <ul className="modal-body">
						      	 <li className="w-template-name">
						      	 	<label className="w-tpl-label">Name:</label><input onKeyDown={this.add} placeholder="template name" type="text" className="form-control w-tpl-name" maxLength="64" />
						      	 </li>
						      	 <li className="w-template-type">
						      	 	<label className="w-tpl-label">Engine:</label>
						      	 	{state.engineList.map(function(name) {
					      	 			return (
					      	 				<label key={name} data-name={name}><input type="radio" data-type={name} name="tplName" />{name}</label>
					      	 			);
					      	 		})}<a title="Help" className="glyphicon glyphicon-question-sign w-vase-help" href="https://github.com/whistle-plugins/whistle.vase#whistlevase" target="_blank"></a>
						      	 </li>
						      </ul>
						      <div className="modal-footer">
						        <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
						        <button onClick={this.add} type="button" className="btn btn-primary">Confirm</button>
						      </div>
						    </div>
					    </div>
					</div>
					<div ref="editTpl" className="modal fade w-create-tpl">
						<div className="modal-dialog"> 
					  		<div className="modal-content">
						      <ul className="modal-body">
						      	 <li className="w-template-name">
						      	 	<label className="w-tpl-label">Name:</label><input onKeyDown={this.edit} placeholder="template name" type="text" className="form-control w-tpl-name" maxLength="64" />
						      	 </li>
						      	 <li className="w-template-type">
						      	 	<label className="w-tpl-label">Engine:</label>
						      	 	{state.engineList.map(function(name) {
					      	 			return (
					      	 				<label key={name} data-name={name}><input type="radio" data-type={name} name="tplName" />{name}</label>
					      	 			);
					      	 		})}<a title="Help" className="glyphicon glyphicon-question-sign w-vase-help" href="https://github.com/whistle-plugins/whistle.vase#whistlevase" target="_blank"></a>
						      	 </li>
						      </ul>
						      <div className="modal-footer">
						        <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
						        <button onClick={this.edit} type="button" className="btn btn-primary">Confirm</button>
						      </div>
						    </div>
					    </div>
					</div>
					<div ref="tplSettingsDialog" className="modal fade w-tpl-settings-dialog">
						<div className="modal-dialog">
						  	<div className="modal-content">
						      <div className="modal-body">
						      	<EditorSettings theme={theme} fontSize={fontSize} lineNumbers={showLineNumbers}
							      	onThemeChange={this.onThemeChange} 
							      	onFontSizeChange={this.onFontSizeChange} 
							      	onLineNumberChange={this.onLineNumberChange} />
						      </div>
						      <div className="modal-footer">
						        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
						      </div>
						    </div>
						</div>
					</div>
				</div>);
	}
});

(function init() {
	dataCenter.init(function(data) {
		if (!data || !data.list) {
			return setTimeout(init, 1000);
		}
		ReactDOM.render(<Index data={data} />, $('#main')[0]);
	});
})();
