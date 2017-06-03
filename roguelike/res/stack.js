function Stack(type) {
    this.type = type;
    this.list = [];
}

Stack.prototype.add = function(func) {
    this.list.push(func);
}

Stack.prototype.process = function () {
    for (func in this.list) {
        list[func]();
    }
}