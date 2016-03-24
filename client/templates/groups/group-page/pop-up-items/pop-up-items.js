Template.popUpItems.events({
		"click #create-item": function(event,tmpl){
				console.log("creating item");
				let itemName = $("#item-name").val();
				let itemPrice = +$("#item-price").val();
				let groupId = this._id;
				if(itemName && itemPrice){
						Meteor.call("addItem", itemName, itemPrice, groupId, function(error, result){
								if(error){
										alert(error);
								} else if(result === "item-already-exists"){
										alert("Item " + itemName + " already exists in this group");
								} else {
										console.log("Item " + itemName + " successfully created");
								}
						});
						$('#item-name').val('');
						$('#item-price').val('');
						$("#item-modal").modal("hide");
				} else {
						alert("please fill all fields");
				}
		}
});