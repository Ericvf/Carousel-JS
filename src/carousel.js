var Coverflow = (function() {
    var classNameSelectedTile = "selected";
    var dragFactor = 150;
    var frictionFactor = 20;
    var circleOffsetY = 0.2;

    var circleRadians = Math.PI * 2;
    var quarterRadians = -circleRadians / 4;

    function addClass(e, className) { e.classList.add(className) };

    function removeClass(e, className) { e.classList.remove(className) };

    function getTouchEvent(e) { return e.changedTouches ? e.changedTouches[0] : e };

    function negativeModulo(x, n) { return (x % n + n) % n };

    function Coverflow(containerId) {
        this.dx, this.dy, this.tileW, this.tileH, this.centerX, this.centerY, this.radius, this.rotationOffset, this.prevTile, this.selectedTile = 0;
        this.containerId = containerId;
        this.touchPositionX;
    }

    Coverflow.prototype.start = function() {
        var self = this;
        document.addEventListener("DOMContentLoaded", function() {
            self.onLoad();
            self.update();
        });

        window.onresize = function() {
            self.onResize()
        };

        document.addEventListener("touchstart", function(e) {
            self.touchstart(e);
        });

        document.addEventListener("mousedown", function(e) {
            self.touchstart(e);
        });

        document.addEventListener("touchend", function(e) {
            self.touchend(e);
        });

        document.addEventListener("mouseup", function(e) {
            self.touchend(e);
        });
    }

    Coverflow.prototype.update = function() {
        var self = this;
        window.requestAnimationFrame(function() {
            self.onRender();
        });
    }

    Coverflow.prototype.touchstart = function(e) {
        this.touchPositionX = getTouchEvent(e).clientX;
    }

    Coverflow.prototype.touchend = function(e) {
        if (this.touchPositionX != null) {
            let dragDelta = getTouchEvent(e).clientX - this.touchPositionX;
            let dragLength = Math.abs(dragDelta);
            let dragDirection = dragDelta < 0 ? -1 : 1;

            let selectOffset = dragLength > dragFactor ?
                Math.floor(dragLength / dragFactor) :
                0;

            if (selectOffset > 0) {
                this.selectCard(this.selectedTile - selectOffset * dragDirection);
                e.preventDefault();
            }

            this.touchPositionX = null;
        }
    }

    Coverflow.prototype.onResize = function() {
        this.tileW = window.innerWidth / 6;
        this.tileH = window.innerWidth / 10;
        this.centerX = window.innerWidth / 2;
        this.centerY = window.innerHeight / 2;

        this.dx = this.centerX - (this.tileW / 2) + this.container.offsetLeft;
        this.dy = this.centerY - (this.tileH / 2) + this.container.offsetTop;
        this.radius = this.centerX / 2.75;

        for (var i = 0; i < this.tileCount; i++) {
            this.tiles[i].style.width = this.tileW + "px";
            this.tiles[i].style.height = this.tileH + "px";
        }
    };

    Coverflow.prototype.onLoad = function() {
        this.container = document.getElementById(this.containerId);
        this.tiles = container.querySelectorAll("div.tile");
        this.tileCount = this.tiles.length;
        this.targetRotationOffset = this.selectedTile / this.tileCount;
        this.rotationOffset = 0;
        addClass(this.tiles[0], classNameSelectedTile);
        this.onResize();

        var self = this;
        document.getElementById('btnPrev').onclick = function() { return self.selectCard(self.selectedTile - 1); }
        document.getElementById('btnNext').onclick = function() { return self.selectCard(self.selectedTile + 1); }

        for (var i = 0; i < this.tileCount; i++) {
            this.tiles[i].onclick = function(e) { return self.handleClick(e); }
            this.tiles[i].setAttribute("data-index", i);
        }
    };

    Coverflow.prototype.handleClick = function(e) {
        var index = parseInt(e.target.getAttribute("data-index"));
        this.selectCard(index, e);
    };

    Coverflow.prototype.selectCard = function(index, e) {

        index = negativeModulo(index, this.tileCount);
        if (index == this.selectedTile)
            return;

        removeClass(this.tiles[this.selectedTile], classNameSelectedTile);

        var distanceClockwise = index - this.selectedTile;
        var distanceCounterwise = this.tileCount - Math.abs(distanceClockwise);

        if (this.selectedTile < index)
            distanceCounterwise *= -1;

        var offset = Math.abs(distanceClockwise) < Math.abs(distanceCounterwise) ?
            distanceClockwise :
            distanceCounterwise;

        this.targetRotationOffset += offset / this.tileCount;

        this.prevTile = this.selectedTile;
        this.selectedTile = index;
    };

    Coverflow.prototype.onRender = function() {
        for (var i = 0; i < this.tileCount; i++) {
            var positionDelta = i / this.tileCount;

            var angle = quarterRadians + circleRadians * (positionDelta - this.rotationOffset);
            var sina = Math.sin(angle);
            var cosa = Math.cos(angle);

            angle = Math.atan2(sina + circleOffsetY, cosa);
            sina = Math.sin(angle);
            cosa = Math.cos(angle);

            var factor = Math.max(0, (sina * -1) - 0.8);
            var scale = 1;

            if (i == this.selectedTile || i == this.prevTile)
                scale += +(factor * 5);

            var x = cosa * this.radius * 2;
            var y = sina * this.radius;

            this.tiles[i].style.zIndex = 100 + -Math.round(sina * 100);

            this.tiles[i].style.transform = 'scale(' + scale + ')';
            this.tiles[i].style.left = this.dx + x + "px";
            this.tiles[i].style.top = this.dy + y - (factor * 200) + "px";

        }

        if (Math.abs(this.targetRotationOffset - this.rotationOffset) > 0.0001) {
            this.rotationOffset += (this.targetRotationOffset - this.rotationOffset) / frictionFactor;

            if (Math.abs(this.targetRotationOffset - this.rotationOffset) < 0.05)
                addClass(this.tiles[this.selectedTile], classNameSelectedTile);
        } else {
            this.rotationOffset = this.targetRotationOffset;
        }

        this.update();
    };

    return Coverflow;
}());