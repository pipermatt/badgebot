const csv = require('@fast-csv/parse');
const { MessageEmbed } = require('discord.js');
const console = require('console');

const filename = './assets/badges.csv';
let badges = new Array();

csv.parseFile(filename)
	.on("data", data => badges.push(data))
	.on("end", rowCount => console.log(`${rowCount - 1} rows read from ${filename}...`));

const Fields = {
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

const badgeColors = new Map();
badgeColors.set(Fields.CommonBadges, 'GREY');
badgeColors.set(Fields.UncommonBadges, 'GREEN');
badgeColors.set(Fields.RareBadges, 'RARE');
badgeColors.set(Fields.EpicBadges, 'PURPLE');
badgeColors.set(Fields.LegendaryBadges, 'GOLD');

function HandleCommand(message, args) {
    if (!args.length) {
        return message.reply("I didn't quite get that... try `!badges help`");
    } else if (args[0] === 'help') {
        return message.channel.send('> GoT:WiC Badges Bot - Calculates optimal badge count\n> \n> **Usage**: `!badges #`');
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

function SendMessage(message, badges) {
    const embed = new MessageEmbed()
        .setAuthor('GoT:WiC Badges Bot', "https://raw.githubusercontent.com/pipermatt/badgebot/main/assets/Badge.png", "https://github.com/pipermatt/badgebot")
        .setTitle(`Optimal Badge Configuration Report for ${message.member ? message.member.displayName : message.author.username }`)  
        .setDescription(GenerateDescription(badges))
        .setColor(GetHighestBadgeColor(badges))
        .addFields(
            { name: 'Total', value: badges[Fields.TotalCommonBadges], inline: true },
            { name: 'Used ', value: badges[Fields.UsedCommonBadges], inline: true },
            { name: 'Bonus', value: badges[Fields.TotalBonus], inline: true })
        .setFooter(GenerateFooter(badges))

    message.channel.send(embed);
}

function GenerateDescription(badges) {
    var description = "";

    if (badges[Fields.CommonBadges] > 0) description += `**Common**: ${badges[Fields.CommonBadges]}\n`;
    if (badges[Fields.UncommonBadges] > 0) description += `**Uncommon**: ${badges[Fields.UncommonBadges]}\n`;
    if (badges[Fields.RareBadges] > 0) description += `**Rare**: ${badges[Fields.RareBadges]}\n`;
    if (badges[Fields.EpicBadges] > 0) description += `**Epic**: ${badges[Fields.EpicBadges]}\n`;
    if (badges[Fields.LegendaryBadges] > 0) description += `**Legendary**: ${badges[Fields.LegendaryBadges]}\n`;
    
    return description;
}

function GetHighestBadgeColor(badges) {
    for (var i = Fields.LegendaryBadges; i > Fields.CommonBadges; i--) {
        if (badges[i] > 0) return badgeColors.get(i);
    }
}

function GenerateFooter(badges) {
    var next = DetermineNextUpgrade(badges[Fields.TotalCommonBadges]);
    var more = next[Fields.TotalCommonBadges] - badges[Fields.TotalCommonBadges];

    if (more > 0) {
      return `Next upgrade: ${more} more badge${more > 1 ? 's' : ''} will boost your bonus to ${next[Fields.TotalBonus]}\n`;      
    } else {
      return 'Reached max bonus';
    }
}

function DetermineNextUpgrade(current) {
    var currentBonus = badges[current][Fields.TotalBonus];
    var next = parseInt(current);

    while (next + 1 < badges.length - 1) {
        next++;
        if (badges[next][Fields.TotalBonus] > currentBonus) {
            return badges[next];
        }
    }

    return badges[next];
}

module.exports = {
    name: 'badges',
    execute(message, args) { return HandleCommand(message, args); },
}