var wasChanged = false;

var flatsArray = [];

var chartData = {};
var chartCanvas = {};
var updateChart = function() {
	chartCanvas.Bar(chartData, {
		responsive: true,
		tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= $.number(value, 2, ',', ' ') %>"
	});
	$("#debts-chart-bar").width($(".col-xs-12").width());
};

var dataRefresh = function () {
	var filter = $('#debts-filter').val();
	var filterMin = parseFloat($('#debts-filter-min').val());
	var filterMax = parseFloat($('#debts-filter-max').val());

	var jsonData = $.parseJSON(data);

	if (filter) {
		jsonData = $.grep(jsonData, function (address) {
			return address.Street.indexOf(filter) !== -1;
		});
	}

	if (filterMin) {
		$.each(jsonData, function(index, block) {
			block.Flats = $.grep(block.Flats, function (flat) {
				return parseFloat(flat.Debt) > filterMin;
			});
		});
	}

	if (filterMax) {
		$.each(jsonData, function (index, block) {
			block.Flats = $.grep(block.Flats, function (flat) {
				return parseFloat(flat.Debt) < filterMax;
			});
		});
	}

	if (filterMin || filterMax) {
		jsonData = $.grep(jsonData, function (address) {
			return address.Flats.length > 0;
		});
	}

	$('#debts-blocks-quantity').text(jsonData.length);

	var debtsFlatsQuantity = 0;
	var debtsSum = 0;

	flatsArray = [];
	var debtsArray = [];

	chartData = {
		labels: [],
		datasets: [{
			data: []
		}]
	};	

	$.each(jsonData, function (index, block) {
		debtsFlatsQuantity += block.Flats.length;

		var blockDebtsSum = 0;
		$.each(block.Flats, function (index, flat) {
			flat.Street = block.Street;
			flatsArray.push(flat);

			blockDebtsSum += flat.Debt;
			debtsSum += flat.Debt;

			debtsArray.push(flat.Debt);
		});

		block.DebtsSum = blockDebtsSum;

		chartData.labels.push(block.Street);
		chartData.datasets[0].data.push(blockDebtsSum);
	});

	if (wasChanged) {
		updateChart();
	} else {
		chartCanvas = new Chart($("#debts-chart-bar").get(0).getContext("2d"));
		wasChanged = true;
	}

	var topQuantity = 5;

	var top5Blocks = jsonData.sort(function (a, b) {
		return parseFloat(b.DebtsSum) - parseFloat(a.DebtsSum);
	}).slice(0, topQuantity);

	var top5Flats = flatsArray.sort(function (a, b) {
		return parseFloat(b.Debt) - parseFloat(a.Debt);
	}).slice(0, topQuantity);	

	$('#debts-list tr.removable').remove();

	$('#debts-flats-quantity').text(debtsFlatsQuantity);
	$('#debts-sum').text($.number(debtsSum, 2, ',', ' '));
	
	if(debtsArray.length > 0) {
		$('#debts-avg').text($.number(math.sum(debtsArray) / debtsArray.length, 2, ',', ' '));
		$('#debts-median').text($.number(math.median(debtsArray), 2, ',', ' '));
		$('#debts-max').text($.number(math.max(debtsArray), 2, ',', ' '));
	} else {
		$('#debts-avg').text($.number(0, 2, ',', ' '));
		$('#debts-median').text($.number(0, 2, ',', ' '));
		$('#debts-max').text($.number(0, 2, ',', ' '));
	}

	$('#debts-blocks-top tr.removable').remove();
	$.each(top5Blocks, function (index, value) {
		$('#debts-blocks-top > tbody:last').append('<tr class="removable"><td>' + value.Street + '</td><td>' + $.number(value.DebtsSum, 2, ',', ' ') + ' <span class="fa fa-ruble"></span></td></tr>');
	});

	$('#debts-flats-top tr.removable').remove();
	$.each(top5Flats, function (index, value) {
		$('#debts-flats-top > tbody:last').append('<tr class="removable"><td>' + value.Street + ', ' + value.Flat + '</td><td>' + $.number(value.Debt, 2, ',', ' ') + ' <span class="fa fa-ruble"></span></td></tr>');
	});
};

dataRefresh();

$('#debts-button-display-all').click(function () {
	Pace.restart();
	$('#debts-button-display-all').addClass('disabled');

	setTimeout(function () {
		$.each(flatsArray, function (index, value) {
			$('#debts-list > tbody:last').append('<tr class="removable"><td>' + value.Street + ', ' + value.Flat + '</td><td>' + $.number(value.Debt, 2, ',', ' ') + ' <span class="fa fa-ruble"></span></td></tr>');
		});

		Pace.stop();
		$('#debts-button-display-all').removeClass('disabled');

	}, 200);
});

$('#debts-button-display-chart').click(function () {
	if (!wasChanged) {
		chartCanvas = new Chart($("#debts-chart-bar").get(0).getContext("2d"));
	}
	updateChart();
	wasChanged = true;
});

$('#debts-button-filter').click(function () {
	dataRefresh();
});
$('#debts-button-filter-max').click(function () {
	dataRefresh();
});
$('#debts-button-filter-min').click(function () {
	dataRefresh();
});

$('#debts-filter').keypress(function (event) {
	if (event.keyCode === 13) {
		dataRefresh();
	}
});
$('#debts-filter-max').keypress(function (event) {
	if (event.keyCode === 13) {
		dataRefresh();
	}
});
$('#debts-filter-min').keypress(function (event) {
	if (event.keyCode === 13) {
		dataRefresh();
	}
});

