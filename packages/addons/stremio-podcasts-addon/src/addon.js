require('dotenv').config();
const {addonBuilder} = require("stremio-addon-sdk");

const GpodderAdapter = require("./adapters/gpodder-adapter");
const gpodderAdapter = new GpodderAdapter();
const ListenNotesAdapter = require("./adapters/listennotes-adapter");
const listenNotesAdapter = new ListenNotesAdapter();

module.exports = async () => {
    const manifest = {
        "id": "com.sleeyax.podcasts-addon",
        "version": "1.0.0",
        "catalogs": [
            {
                "id": "podcasts_gpodder_catalog",
                "type": "Podcasts",
                "name": "Gpodder",
                "genres": await gpodderAdapter.getGenres(),
                "extra": [{"name": "search", "isRequired": false}, {"name": "genre", "isRequired": false}, {"name": "skip", "isRequired": false}],
            },
            {
                "id": "podcasts_listennotes_catalog",
                "type": "Podcasts",
                "name": "Listen notes",
                "genres": await listenNotesAdapter.getGenres(),
                "extra": [{"name": "search", "isRequired": false}, {"name": "genre", "isRequired": false}, {"name": "skip", "isRequired": false}],
            }
        ],
        "resources": ["catalog", "meta", "stream"],
        "types": ["series", "channel"],
        "name": "Podcasts",
        "logo": "https://i.imgur.com/d3ZykZR.png",
        "description": "#1 podcasts addon offering 688,000+ high quality podcasts from multiple sources!",
        "idPrefixes": ["podcasts_"]
    };
    const builder = new addonBuilder(manifest);

    builder.defineCatalogHandler(async args => {
        console.log("catalogs: ", args);

        let metas = [];

        switch(args.id.split("_")[1]) {
            case "gpodder":
                metas = await gpodderAdapter.getSummarizedMetaDataCollection(args);
                break;
            case "listennotes":
                metas = await listenNotesAdapter.getSummarizedMetaDataCollection(args);
                break;
            default:
                break;
        }
        return {metas};
    });

    builder.defineMetaHandler(async args => {
        console.log("meta: ", args);

        switch(args.id.split("_")[1]) {
            case "gpodder":
                return gpodderAdapter.getMetaData(args);
            case "listennotes":
                return listenNotesAdapter.getMetaData(args);
            default:
                return Promise.resolve({meta: null});
        }

    });

    builder.defineStreamHandler(async args => {
        console.log("streams: ", args);

        switch(args.id.split("_")[1]) {
            case "gpodder":
                return await gpodderAdapter.getStreams(args);
            case "listennotes":
                return await listenNotesAdapter.getStreams(args);
            default:
                return Promise.resolve({streams: null});
        }
    });

    return builder.getInterface();
};