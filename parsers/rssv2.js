var utils = require('./utils');
var model = require('../model/rss');
var namespaces = require('./namespaces');
var itunesParser = require('./itunes');

exports.parse = function (document) {
  let parsedFeed = Object.assign({}, model.rss);

  parsedFeed = mapChannelFields(document, parsedFeed);
  parsedFeed.type = 'rss-v2';
  parsedFeed.items = mapItems(document);

  return parsedFeed;
};

function mapChannelFields(document, parsedFeed) {
  const channelNodes = utils.getElements(document, 'channel');

  if (!channelNodes || channelNodes.length === 0) {
    throw new Error('Could not find channel node');
  }

  const channelNode = channelNodes[0];

  parsedFeed.title = getChannelTitle(channelNode);
  parsedFeed.links = getChannelLinks(channelNode);
  parsedFeed.description = getChannelDescription(channelNode);
  parsedFeed.language = getChannelLanguage(channelNode);
  parsedFeed.copyright = getChannelCopyright(channelNode);
  parsedFeed.authors = getChannelAuthors(channelNode);
  parsedFeed.lastUpdated = getChannelLastUpdated(channelNode);
  parsedFeed.lastPublished = getChannelLastPublished(channelNode);
  parsedFeed.categories = getChannelCategories(channelNode);
  parsedFeed.image = getChannelImage(channelNode);
  parsedFeed.itunes = itunesParser.parseChannel(channelNode);

  return parsedFeed;
}

function getChannelTitle(node) {
  return utils.getElementTextContent(node, 'title');
}

function getChannelLinks(node) {
  const links = utils.getChildElements(node, 'link');

  return links.map(function (link) {
    return {
      url: link.textContent,
      rel: link.getAttribute('rel')
    };
  });
}

function getChannelDescription(node) {
  return utils.getElementTextContent(node, 'description');
}

function getChannelLanguage(node) {
  return utils.getElementTextContent(node, 'language');
}

function getChannelCopyright(node) {
  return utils.getElementTextContent(node, 'copyright');
}

function getChannelAuthors(node) {
  const authors = utils.getElementTextContentArray(node, 'managingEditor');

  return authors.map(function (author) {
    return {
      name: author
    };
  });
}

function getChannelLastUpdated(node) {
  return utils.getElementTextContent(node, 'lastBuildDate');
}

function getMediaKeywords(node) {
  return utils.getElementTextContent(node, 'media:keywords');
}

function getChannelLastPublished(node) {
  return utils.getElementTextContent(node, 'pubDate');
}

function getChannelCategories(node) {
  const categories = utils.getElementTextContentArray(node, 'category');

  return categories.map(function (category) {
    return {
      name: category
    }
  });
}

function getChannelImage(node) {
  const imageNodes = utils.getChildElements(node, 'image');

  if (imageNodes.length === 0) {
    return {
      url: undefined,
      title: undefined,
      description: undefined,
      width: undefined,
      height: undefined
    };
  }

  const imageNode = imageNodes[0];

  return {
    url: utils.getElementTextContent(imageNode, 'url'),
    title: utils.getElementTextContent(imageNode, 'title'),
    description: utils.getElementTextContent(imageNode, 'description'),
    width: utils.getElementTextContent(imageNode, 'width'),
    height: utils.getElementTextContent(imageNode, 'height'),
  };
}

function getItemTitle(node) {
  return utils.getElementTextContent(node, 'title');
}

function getItemLinks(node) {
  const links = utils.getChildElements(node, 'link');

  return links.map(function (link) {
    return {
      url: link.textContent,
      rel: link.getAttribute('rel')
    };
  });
}

function getItemDescription(node) {
  return utils.getElementTextContent(node, 'description');
}

function getItemContent(node) {
  return utils.getElementTextContent(node, 'encoded', namespaces.content);
}

function getItemAuthors(node) {
  const authors = utils.getElementTextContentArray(node, 'author');

  return authors.map(function (author) {
    return {
      name: author
    };
  });
}

function getItemCategories(node) {
  const categories = utils.getElementTextContentArray(node, 'category');

  return categories.map(function (category) {
    return {
      name: category
    }
  });
}

function getItemId(node) {
  return utils.getElementTextContent(node, 'guid');
}

function getItemPublished(node) {
  return utils.getElementTextContent(node, 'pubDate');
}

function getItemEnclosures(node) {
  const enclosures = utils.getChildElements(node, 'enclosure');

  return enclosures.map(function (enclosure) {
    return {
      url: enclosure.getAttribute('url'),
      length: enclosure.getAttribute('length'),
      mimeType: enclosure.getAttribute('type')
    }
  });
}

function mapItems(document) {
  const itemNodes = utils.getElements(document, 'item');

  return itemNodes.map(function (item) {
    return {
      title: getItemTitle(item),
      links: getItemLinks(item),
      description: getItemDescription(item),
      content: getItemContent(item),
      id: getItemId(item),
      authors: getItemAuthors(item),
      categories: getItemCategories(item),
      published: getItemPublished(item),
      enclosures: getItemEnclosures(item),
      itunes: itunesParser.parseItem(item),
      'media:keywords': getMediaKeywords(item),
      'media:group': getMediaGroup(item),
    };
  });
}
function getMediaContent(node) {
  return {
    url: node.getAttribute('url'),
    type: node.getAttribute('type'),
    expression: node.getAttribute('expression'),
    filesize: node.getAttribute('filesize'),
    duration: node.getAttribute('duration'),
    medium: node.getAttribute('medium'),
    bitrate: node.getAttribute('bitrate'),
    samplingrate: node.getAttribute('samplingrate'),
    channels: node.getAttribute('channels'),
    height: node.getAttribute('height'),
    width: node.getAttribute('width'),
  }
}

function getMediaGroup(node) {
  const mediaGroupNodes = utils.getChildElements(node, 'media:group');
  if (mediaGroupNodes.length == 0) return
  mediaGroupNode = mediaGroupNodes[0]
  const mediaContentNodes = utils.getChildElements(mediaGroupNode, 'media:content');
  return {
    'media:content': mediaContentNodes.map(function (mediaContentNode) {
      return getMediaContent(mediaContentNode)
    })
  }
}
