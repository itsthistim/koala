const { Argument, Resolvers } = require("@sapphire/framework");
const { loadImage } = require('canvas');
const ClientUtil = require('../utils/clientutil.js');

module.exports = class ImageArgument extends Argument {
  async run(parameter, context) {
    if (this.validURL(parameter)) {
      parameter = parameter.replace('<', '');
      parameter = parameter.replace('>', '');
      return this.ok(parameter);
    }

    return this.error({
      context,
      parameter,
      message: 'The provided argument could not be resolved to an image.',
      identifier: 'InvalidImage'
    });
  }

  validURL(str) {
    var pattern = new RegExp('^<?https?:\/\/.*(jpe?g|png)>?$', 'i');
    return pattern.test(str);
  }
}

//#region wip old
// const { Argument, Resolvers } = require("@sapphire/framework");
// const { loadImage } = require('canvas');
// const ClientUtil = require('../utils/clientutil.js');

// module.exports = class ImageArgument extends Argument {
//   async run(parameter, context) {
//     // try {
//     // 	return this.ok(await loadImage(parameter));
//     // } catch {
//     //   return this.error({
//     //     context,
//     //     parameter,
//     //     message: 'The provided parameter does not include an valid image.',
//     //     identifier: 'InvalidImageError'
//     //   });
//     // }

//     const msg = context.message;

//     // attachments
//     const attachment = msg.attachments.first();
//     if (attachment) return this.ok(attachment.url);

//     // make <links> work
//     parameter = parameter.replace('<', '');
//     parameter = parameter.replace('>', '');

//     // regex to check if the given string ends in a valid file type
//     const fileTypeReg = /\.(jpe?g|png|gif|jfif|bmp)$/i;

//     // if regex returns true then return it to the commmand
//     if (fileTypeReg.test(parameter.toLowerCase())) return this.ok(parameter);

//     // if its not an url check if its a member. if it is return the members pfp url to the command
//     try {
//       const member = ClientUtil.resolveMember(parameter, msg.guild);
//       return this.ok(member.user.displayAvatarURL({ format: 'png', size: 512 }));
//     } catch (err) {
//       return this.error({
//         context,
//         parameter,
//         message: 'The provided argument was neither an image nor a member.',
//         identifier: 'ImageOrMemberError'
//       });
//     }
//   }
// }

// /**
// * Get a image attachment from a message.
// * @param message The Message instance to get the image url from
// */
// // export function getAttachment(message: Message): ImageAttachment | null {
// //   if (message.attachments.size) {
// //     const attachment = message.attachments.find((att) => IMAGE_EXTENSION.test(att.url));
// //     if (attachment) {
// //       return {
// //         url: attachment.url,
// //         proxyURL: attachment.proxyURL,
// //         height: attachment.height!,
// //         width: attachment.width!
// //       };
// //     }
// //   }

// //   for (const embed of message.embeds) {
// //     if (embed.type === 'image') {
// //       return {
// //         url: embed.thumbnail!.url,
// //         proxyURL: embed.thumbnail!.proxyURL!,
// //         height: embed.thumbnail!.height!,
// //         width: embed.thumbnail!.width!
// //       };
// //     }
// //     if (embed.image) {
// //       return {
// //         url: embed.image.url,
// //         proxyURL: embed.image.proxyURL!,
// //         height: embed.image.height!,
// //         width: embed.image.width!
// //       };
// //     }
// //   }

// //   return null;
// // }
//#endregion