const csv = require('@fast-csv/parse');
const { MessageEmbed } = require('discord.js');
const console = require('console');

const filename = './assets/badges.csv';
let badges = new Array();

csv.parseFile(filename)
	.on("data", data => badges.push(data))
	.on("end", rowCount => console.log(`${rowCount - 1} rows read from ${filename}...`));

var Fields = {
    TotalCommonBadges: 0,
    UsedCommonBadges: 1,
    UnusedCommonBadges: 2,
    TotalBonus: 3,
    CommonBadges: 4,
    UncommonBadges: 5,
    RareBadges: 6,
    EpicBadges: 7,
    LegendaryBadges: 8
}

function HandleCommand(message, args) {
    if (!args.length) {
        return message.channel.send('> GoT:WiC Badges Bot - Calculates optimal badge count\n> \n> **Usage**: `!badges 10`');
    }

    const badgeCount = parseInt(args[0]);

    if (isNaN(badgeCount)) {
        return message.reply('that doesn\'t seem to be a valid number. How many common badges have you got to work with?');
    } else if (badgeCount < 0 || badgeCount > 2048) {
        return message.reply('you need to input a number between 0 and 2048.');
    } else if (badgeCount == 0) {
        return message.channel.send('https://www.youtube.com/watch?v=VqomZQMZQCQ');
    } else {
        return SendMessage(message, badges[badgeCount]);
    }
}

function SendMessage(message, data) {
    const embed = new MessageEmbed();
    embed.setColor('#0099ff')
    embed.addFields(
            { name: 'Total', value: data[Fields.TotalCommonBadges], inline: true },
            { name: 'Used ', value: data[Fields.UsedCommonBadges], inline: true },
            { name: 'Bonus', value: data[Fields.TotalBonus], inline: true });

    var title = 'Optimal Badge Configuration Report';
    if (message.member.displayName) {
        title += ` for ${message.member.displayName}`;
    }
    embed.setTitle(title);

    var description = '';
    if (data[Fields.CommonBadges] > 0) description += `**Common**: ${data[Fields.CommonBadges]}\n`;
    if (data[Fields.UncommonBadges] > 0) description += `**Uncommon**: ${data[Fields.UncommonBadges]}\n`;
    if (data[Fields.RareBadges] > 0) description += `**Rare**: ${data[Fields.RareBadges]}\n`;
    if (data[Fields.EpicBadges] > 0) description += `**Epic**: ${data[Fields.EpicBadges]}\n`;
    if (data[Fields.LegendaryBadges] > 0) description += `**Legendary**: ${data[Fields.LegendaryBadges]}\n`;
    embed.setDescription(description);
            
    var next = DetermineNextUpgrade(data[Fields.TotalCommonBadges]);
    var more = next - data[Fields.TotalCommonBadges];
    var footer = `Next upgrade: ${more} more badge${more > 1 ? 's' : ''} will boost your bonus to ${badges[next][Fields.TotalBonus]}\n`;

    embed.setFooter(footer)

    message.channel.send(embed);
}

function DetermineNextUpgrade(current) {
    var currentBonus = badges[current][Fields.TotalBonus];
    var next = parseInt(current) + 1;

    while (next < badges.length - 1) {
        if (badges[next][Fields.TotalBonus] > currentBonus) {
            return next;
        }
        next++;
    }

    return next;
}

module.exports = {
    name: 'badges',
    execute(message, args) { return HandleCommand(message, args); },
}