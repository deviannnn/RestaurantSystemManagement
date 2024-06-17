const fs = require('fs');
const path = require('path');

const activeMail = path.join(process.cwd(), 'public/assets/html/activeMail.html');

const ActiveMail = (fullName, gender, username, password, link) => {
    const replacements = {
        '{{FULLNAME}}': fullName,
        '{{GENDER}}': gender === true ? 'Mr' : 'Mrs',
        '{{USERNAME}}': username,
        '{{PASSWORD}}': password,
        '{{LINK}}': link
    };

    let mailHtml = fs.readFileSync(activeMail, 'utf8');

    for (const [key, value] of Object.entries(replacements)) {
        mailHtml = mailHtml.replace(new RegExp(key, 'g'), value);
    }

    return mailHtml;
}

module.exports = { ActiveMail };
