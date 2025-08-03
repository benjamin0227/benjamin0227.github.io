
// 获取dom元素
const btn = document.getElementById('sayHigh')
const input = document.getElementById('nameInput')

// 事件监听
// 元素.addEventListener('事件名称', 回调函数）
btn.addEventListener('click', function() {
    const name = input.value.trim();//去掉首尾空格

    const who = name || 'friend';

    // 模板字符串要用反引号！
    alert(`Hello, ${who}!`);
    document.title = `你好, ${who}`;
});

// 回车触发
input.addEventListener('keydown', function(event){
    if (event.key == 'Enter') {
        btn.click();
    }
});