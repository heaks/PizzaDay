Template.popUpForm.events({
	"click #new-group": function(event, tmpl) {
		var groupName = $("#group-name").val();
		var groupDescription = $("#description-text").val();
		var icon = $("#group-icon").val();
		if (groupName && groupDescription) {
			Meteor.call("createGroup", groupName, groupDescription, icon, function(error, result) {
				if (error) {
					alert(error);
				} else {
					Router.go("groupPage", {_id: result});
				}
			});
		} else {
			alert("please fill all the fields")
		}
	}
});