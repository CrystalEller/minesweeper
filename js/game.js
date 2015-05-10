function Game(width, height, mines, table) {
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.table = table;
    this.countToWin = 0;

    this.init();
}

Game.prototype.init = function () {
    this.countToWin = this.width * this.height - this.mines;

    for (var i = 0; i < this.height; i++) {
        var tr = $('<tr>');

        for (var j = 0; j < this.width; j++) {
            tr.append($('<td>'));
        }
        this.table.append(tr);
    }

    this.addEventListeners();
};

Game.prototype.addEventListeners = function () {
    var that = this;

    this.table.one('init.click', function (e, target) {
        that.generateMines(target);
        that.generateNumbers();
    });

    this.table.on('mouseup', 'td', function (e) {
        var target = $(e.target);

        if (e.which == 1) {
            var img = target.find('img');

            if (img.length > 0) {
                img.remove();
                return;
            }

            target.addClass('clicked');
            that.table.trigger('init.click', [target]);

            if (target.data('hasMine')) {
                that.gameEvents.lose(that);
            } else {
                if (!target.data('number')) {
                    that.openEmpty(target);
                }
                if (--that.countToWin <= 0) {
                    that.gameEvents.win(that);
                }
                target.append($('<span>').text(target.data('number')));
            }
        }

        if (e.which == 2) {
            that.toggleFlag(target);
        }
    });

};

Game.prototype.gameEvents = {
    lose: function (that) {
        var res = confirm('You lose. Try again?');

        if (res) {
            that.refresh();
        } else {

        }
    },
    win: function (that) {
        var res = confirm('You win. Try again?');

        if (res) {
            that.refresh();
        } else {

        }
    }
};

Game.prototype.toggleFlag = function (td) {
    var img = td.find('img');

    if (img.length > 0) {
        img.remove();
    } else {
        if (!td.hasClass('clicked')) {
            var img = $('<img>').attr({
                'src': 'img/flag.png',
                'width': td.width() / 2,
                'height': td.height() / 2
            }).css({
                display: 'block',
                position: 'absolute',
                top: td.offset().top + td.width() / 3 + 'px',
                left: td.offset().left + td.height() / 3 + 'px'
            });

            img.on('mouseup', function () {
                td.trigger({
                    type: 'mouseup',
                    which: 2
                });
            });

            td.data('flag', true).append(img);
        }
    }

};

Game.prototype.refresh = function () {
    this.table.empty();
    this.table.off('mouseup');
    this.init();
};

Game.prototype.openEmpty = function (td) {
    var that = this;
    var nearCells = this.nearCells(td);

    $.each(nearCells, function (index, value) {
        if (!value.hasClass('clicked')) {
            value.trigger({
                type: 'mouseup',
                which: 1
            });
        }
    });
};

Game.prototype.generateMines = function (firstClickTd) {
    var multiple = this.height * this.width;
    var $cells = this.table.find('td');
    var index = $('#minesField').find('td').index(firstClickTd);

    for (var i = 0; i < this.mines; i++) {
        var number = Math.floor(Math.random() * (multiple + 1)),
            hasMine = $cells.eq(number).data('hasMine');

        if (!hasMine && (index != number)) {
            $cells.eq(number).data('hasMine', true);
        } else {
            i--;
        }
    }


};

Game.prototype.generateNumbers = function () {
    var that = this;

    this.table.find('tr').each(function () {
        $(this).find('td').each(function (index) {
            var number = 0,
                td = $(this);

            if (!td.data('hasMine')) {
                $.each(that.nearCells(td), function (index, value) {
                    if (value.data('hasMine') === true) {
                        number++;
                    }
                });
            }

            number = number ? number : '';

            $(this).data('number', number);
        });
    });
};

Game.prototype.nearCells = function (td) {
    var nearCells = [],
        tr = td.parent(),
        index = tr.children().index(td);

    var prevTr = tr.prev();
    var nextTr = tr.next();

    if (td.prev().length > 0) {
        nearCells.push(td.prev());
    }

    if (td.next().length > 0) {
        nearCells.push(td.next());
    }

    if (prevTr.length > 0) {
        var td = prevTr.find('td').eq(index);

        nearCells.push(td);

        if (td.prev().length > 0) {
            nearCells.push(td.prev());
        }

        if (td.next().length > 0) {
            nearCells.push(td.next());
        }
    }

    if (nextTr.length > 0) {
        var td = nextTr.find('td').eq(index);

        nearCells.push(td);

        if (td.prev().length > 0) {
            nearCells.push(td.prev());
        }

        if (td.next().length > 0) {
            nearCells.push(td.next());
        }
    }

    return nearCells;
};