export default () => {
    self.addEventListener("message", (e) => {
        // eslint-disable-line no-restricted-globals
        if (!e) return;
        self.postMessage(e.data);
        console.log(e);
    });
};
