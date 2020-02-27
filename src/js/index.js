require('./base-css.js');
require('../css/menu.css');
require('../css/index.css');
var $ = window.jQuery = require('jquery'); //for bootstrap
require('bootstrap/dist/js/bootstrap.js');
var React = require('react');
var ReactDOM = require('react-dom');
var List = require('./list');
var ListModal = require('./list-modal');
var EditorSettings = require('./editor-settings');
var util = require('./util');
var storage = require('./storage');
var dataCenter = require('./data-center');

var MAX_FILE_SIZE = 1024 * 1024 * 5;

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
			theme: storage.get('theme'),
			fontSize: storage.get('fontSize'),
			showLineNumbers: storage.get('showLineNumbers')
		};
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
	format: function() {
		var modal = this.state.modal;
		var activeItem = modal.getActive();
		if (!activeItem) {
			return;
		}
		var data = util.parseRawJson(activeItem.value);
		if (data) {
			var value = JSON.stringify(data, null, '  ');
			if (value === activeItem.value) {
				return;
			}
			activeItem.value = value;
			activeItem.changed = true;
			this.setState({});
		}
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
			}
			self.setState({});
		});
	},
	showCreateTplDialog: function() {
		this._showTplDialog($(ReactDOM.findDOMNode(this.refs.createTpl)));
	},
	uploadDataForm: function(data) {
		var file = data.get('importData');
    if (!file || !/\.(txt|json)$/i.test(file.name)) {
      return alert('Only supports .txt, .json file.');
    }

    if (file.size > MAX_FILE_SIZE) {
      return alert('The file size can not exceed 5m.');
		}
		var self = this;
		var modal = self.state.modal;
		for (var i = 0, len = modal.list.length; i < len; ++i) {
			var item = modal.data[modal.list[i]];
			if (item && item.changed) {
				if (!confirm('Importing data will lose the currently unsaved data.\nDo you want to continue?')) {
					return;
				}
				break;
			}
		}


		var reader = new FileReader();
		reader.readAsText(file);
		reader.onload = function(){
			try {
        var result = JSON.parse(this.result);
				if (!Array.isArray(result)) {
					return;
				}
				var params;
				result.forEach(function(item) {
          var value = item.value;
          if (Object.prototype.toString.call(value) === '[object Object]') {
            item.value = JSON.stringify(value);
          }

					if (item && util.isString(item.name, true)
						&& util.isString(item.value) && util.isString(item.type, true)) {
						params = params || [];
						params.push({
							name: item.name,
							value: item.value,
							type: item.type
						});
					}
				});
				if (!params) {
					return alert('No data.');
				}
				dataCenter.importData({
					list: JSON.stringify(params)
				}, function(data) {
					if (!data) {
						return alert('Server internal error, try again later.');
					}
					var map = {};
					var list = data.list.map(function(item) {
						map[item.name] = item;
						return item.name;
					});
					self.state.modal.update(list, map);
					self.setState({});
				});
			} catch (e) {
				alert('Incorrect file format.');
			}
		};
	},
	importData: function() {
		this.uploadDataForm(new FormData(ReactDOM.findDOMNode(this.refs.importDataForm)));
    ReactDOM.findDOMNode(this.refs.importData).value = '';
	},
	clickImport: function() {
		ReactDOM.findDOMNode(this.refs.importData).click();
	},
	onDrop: function(e) {
		var files = e.dataTransfer && e.dataTransfer.files;
		if (!files || !files.length) {
			return;
		}
		var data = new FormData();
		data.append('importData', files[0]);
		this.uploadDataForm(data);
		e.preventDefault();
	},
	onThemeChange: function(e) {
		var theme = e.target.value;
		storage.set('theme', theme);
		this.setState({
			theme: theme
		});
	},
	onFontSizeChange: function(e) {
		var fontSize = e.target.value;
		storage.set('fontSize', fontSize);
		this.setState({
			fontSize: fontSize
		});
	},
	onLineNumberChange: function(e) {
		var showLineNumbers = e.target.checked;
		storage.set('showLineNumbers', showLineNumbers);
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
            <a onClick={this.clickImport} className="w-import-menu" href="javascript:;" draggable="false">
              <span className="glyphicon glyphicon-import"></span>Import
            </a>
            <a className="w-export-menu" href="cgi-bin/export" target="_blank" draggable="false">
              <span className="glyphicon glyphicon-export"></span>Export
            </a>
						<a className="w-create-menu" href="javascript:;" onClick={this.showCreateTplDialog}><span className="glyphicon glyphicon-plus" draggable="false"></span>Create</a>
						<a className="w-edit-menu" href="javascript:;" onClick={this.showEditDialog}><span className="glyphicon glyphicon-edit" draggable="false"></span>Rename</a>
						<a className="w-remove-menu" href="javascript:;" onClick={this.remove}><span className="glyphicon glyphicon-trash" draggable="false"></span>Delete</a>
						<a className="w-save-menu" href="javascript:;" onClick={this.save}><span className="glyphicon glyphicon-save-file" draggable="false"></span>Save</a>
						<a className="w-save-menu" href="javascript:;" onClick={this.format}><span className="glyphicon glyphicon-ok-sign" draggable="false"></span>Format</a>
						<a className="w-settings-menu" href="javascript:;" onClick={this.showTplSettingsDialog}><span className="glyphicon glyphicon-cog" draggable="false"></span>Settings</a>
						<a className="w-help-menu" href="https://github.com/whistle-plugins/whistle.vase#whistlevase" target="_blank"><span className="glyphicon glyphicon-question-sign"></span>Help</a>
						{engineName}
					</div>
					<List onDrop={this.onDrop}
						theme={theme} fontSize={fontSize} lineNumbers={showLineNumbers} onSelect={this.setValue}  modal={this.state.modal} className="w-data-list" />
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
					<form ref="importDataForm" encType="multipart/form-data" style={{display: 'none'}}>
						<input ref="importData" onChange={this.importData} type="file" name="importData" accept=".txt,.json" />
					</form>
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
