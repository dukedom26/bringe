/**
 * Created by sagar.ja on 28/04/17.
 */

function subscene() {
    function getSeasonPart() {
        var seasonNo = thisSerie.seasonNo,
            seasonPart = 's';
        if (seasonNo) {
            if (seasonNo > 9) {
                return seasonPart + seasonNo;
            } else {
                return seasonPart + '0' + seasonNo;
            }
        }
        return '';
    }
    function getEpisodePart() {
        var episodeNo = thisSerie.episodeNo,
            episodePart = 'e';
        if (episodeNo) {
            if (episodeNo > 9) {
                return episodePart + episodeNo;
            } else {
                return episodePart + '0' + episodeNo;
            }
        }
        return '';
    }
    function getSubsceneLinks(links) {
        var list = [];
        if (page != "movie" && page != "serie") return list;
        for (var i=0 ;i<links.length; i++) {
            if(links[i].href.match(/https?:\/\/subscene\.com\/subtitles\/.+\/english\/\d+$/)) {
                list.push(links[i].href);
            }
        }
        return list;
    }
    function searchSubtitle(func) {
        var link;
        if (page == "movie") {
            link = "https://www.google.co.in/search?q=" + thisMovie.name + "+" + thisMovie.year + "+english+-arabic+site:subscene.com/subtitles";
        } else if (page == "serie") {
            link = "https://www.google.co.in/search?q=" + thisSerie.title + "+" + getSeasonPart() + getEpisodePart() + "+english+-arabic+site:subscene.com/subtitles";
            var episode = getSubtitleEpisode();
            if (episode) {
                delete episode.links;
            }
        } else {
            return;
        }
        $.ajax({
            url: link,
            success: function (result) {
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc);
                var links = myDoc.find("a[onmousedown]");
                var subsceneLinks = getSubsceneLinks(links);
                for(var i = 0; i < subsceneLinks.length; i++) {
                    getSubtitleDownloadLink(subsceneLinks[i], func);
                }
            },
            error: function () {
                func(false);
            }
        });
    }
    function getSubtitleSeason() {
        var reqdSeason = null;
        var seasons;
        if (thisSerie.subtitles) {
            seasons = thisSerie.subtitles.seasons;
            util().each(seasons, function (season) {
                if (season.seasonNo == thisSerie.seasonNo) {
                    reqdSeason = season;
                }
            });
        }
        return reqdSeason;
    }
    function getSubtitleEpisode() {
        var reqdEpisode = null;
        var season = getSubtitleSeason();
        if (season) {
            var episodes = season.episodes || [];
            util().each(episodes, function (episode) {
                if (episode.episodeNo == thisSerie.episodeNo) {
                    reqdEpisode = episode;
                }
            });
        }
        return reqdEpisode;
    }
    function getSubtitleDownloadLink(subsenelink, func) {
        if (page != "movie" && page != "serie") return;
        $.ajax({
            url: subsenelink,
            success: function (result) {
                if (page != "movie" && page != "serie") return;
                var parser = new DOMParser(),
                    doc = parser.parseFromString(result, "text/html"),
                    myDoc = $(doc),
                    button = myDoc.find("#downloadButton"),
                    ratingBox = myDoc.find(".rating"),
                    rating = "-";
                if(button.length > 0) {
                    var link = "https://subscene.com" + button.attr("href");
                    if(ratingBox.length > 0) {
                        ratingBox = ratingBox.find("span");
                        if(ratingBox.length > 0)
                            rating = ratingBox.html();
                    }
                    if (page == "movie") {
                        thisMovie.subtitleLinks = thisMovie.subtitleLinks || [];
                        var len = thisMovie.subtitleLinks.length;
                        thisMovie.subtitleLinks.push({link: link, rating: rating, index: len});
                        if (len == 0) {
                            func(true);
                        }
                    } else {
                        thisSerie.subtitles = thisSerie.subtitles || {};
                        thisSerie.subtitles.seasons = thisSerie.subtitles.seasons || [];
                        var season = getSubtitleSeason();
                        if (!season) {
                            season = {seasonNo: thisSerie.seasonNo};
                            thisSerie.subtitles.seasons.push(season);
                        }
                        season.episodes = season.episodes || [];
                        var episode = getSubtitleEpisode();
                        if (!episode) {
                            episode = {episodeNo: thisSerie.episodeNo, links: [{link: link, rating: rating, index: 0}]};
                            season.episodes.push(episode);
                            func(true);
                        } else {
                            episode.links = episode.links || [];
                            len = episode.links.length;
                            episode.links.push({link: link, rating: rating, index: len});
                        }
                    }
                }
            }
        });
    }
    return {
        getSubtitleEpisode: getSubtitleEpisode,
        searchSubtitle: searchSubtitle
    }
}
