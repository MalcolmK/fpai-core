$(window).load(function() {
    w = new widget();

    $("#getBundleList").click(function() {
        w.call("getBundleList", {}, function(data) {
            console.log(data);
        });
    });

    $("#show-bundle-settings").click(function() {
        w.call("getBundleMetaTypeInformation", {}, function(data) {
            console.log(data);
            $("#widget-title").text(data.information.OCD.Name);

            $.each(data.information.ADs, function(key, value) {
                console.log("Key: " + key);
                console.log('Value: ' + value);

                if (isSelectBox(value.ad)) {
                    console.log('Is select box.');
                    var selectBoxArray = createSelectBoxArray(value.ad);

                    var selectBox = $('<select>').appendTo('#settings');
                    $(selectBoxArray).each(function() {
                     selectBox.append($("<option>").attr('value',this.val).text(this.text));
                    });
                }
            });
        });

        $("#show-bundle-settings").remove();
    });

    function isSelectBox(attributeDefinition) {
        return 'optionValues' in attributeDefinition;
    }

    function createSelectBoxArray(attributeDefinition) {
        var options = [];
        $.each(attributeDefinition.optionValues, function(index, value) {
            options.push(
                {
                    val : attributeDefinition.optionValues[index],
                    text : attributeDefinition.optionLabels[index]
                }
            );
        });

        return options;
    }
});
