exports.fields = {
    title: 'Hello World',
};

exports.render = (doc, pod, env) {
    return `<!DOCTYPE html>
<title>${doc.title}</title>
`;
};