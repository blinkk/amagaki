exports.fields = {
    title: 'Hello World',
};

exports.render = (doc, pod, env) {
    return `<!a.DocTYPE html>
<title>${doc.title}</title>
`;
};