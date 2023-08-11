const fs = require("fs");

exports.delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

exports.fetchTraitsData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

exports.fetchMockTraitsDataForBrian = () => {
    return [
        {
            _id: "64d316f8bf04b76cc8578209",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAOxJREFUWIXNlyFuw1AQRJ+/vq1yy7AXCAxspIKSHKX3rNTCwAQWBKZGBY1qsAFbfVK2I2W95GnAk0ZjWbI7wEi8AmDmHSJUXIAKcPryNlEqbvm3yZ2vAnx+e4hScdexwGH2EKXirmOB97OHKBU3fQEAG17NolRcwNIXqAC/Fw9RKm76AgXgYf4gSsVtBTKvAPTLkSgVtxXIvArQXd5QqLjpC/gn2fRMlIrbCmReBVj6DQoVtwJcxycUKm76IygAw+QhQsVtBTKvALzsPUSouK3A7tFDhIoLf2/BdvQQpera/OPfZxEqLmAdyb/nN/VJ23vpW1ElAAAAAElFTkSuQmCC",
            name: "Base View",
            rarity: 2000,
            subtype: "",
            type: "background",
        },
        {
            _id: "64d3171fbf04b76cc857820a",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAJNJREFUWIXt1LENg0AQRNG/diM04IwaKABdL0SWiIFC6AWik8icG+eGyNI6uw6sDTz5SF+a4Nkn3xygGzMAU7UCYFsNQBp2AOaz4Re7S2S8GzPX4/3qo+Llgaj4VK2Y3xePipcHouK21Rite1S8PBAVT8OOpcfTo+Llgaj4fDaYJJSEklASSkJJKAkloSSUhH8v4RcksEoa8wJmZAAAAABJRU5ErkJggg==",
            name: "onchain summer",
            rarity: 2000,
            subtype: "",
            type: "background",
        },
        {
            _id: "64d31726bf04b76cc857820b",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAeZJREFUWIXlVj2KwkAU/iYEsTGNCLK9ZS4QIbWH0FQp9gCCZxA8gIVVyCFSB8wFcgcRgk1sZJtsEd/MxMnssruZKOzX5O/9fDN573vDnNmqwhNh00018XGdhorB8JLx+9vYw/CS4Tb2MDofwIq04UvfHn0eIfsyZ7aqvG2kGB13tdHH2zsGp71yLd0ITh4AAL/X2VYTH/O1urhsE9QE5CC0msUSSGJoV6XbgbbdoljkI5O38YDrNLx/FKsiY8LgtG88syKFcycj2wjfOlbpRoodc2arqpr4yvZQYG8bIdsErd+/A/l+Fd+ih+s0BCtSfqV/9tvksu983YwtF7ulc+4LWgJ/WflPYlkAeDX3CcppA3UbLZYAQHrw+8LTQWhNfT3ufLAiFUKUxBCtknebnECxSzfCYln/GqUGRucDSldVxi6Sj84H5b1CQAhRt3DyoHXWKARMbb8u9uvqQO8E2grEFORc7NknIguohchE6+lQuhGfkBYgWq8PEiRG1JI2gIYMJ7FZJZRzZZs7geOuLor5OjQmxyJmxPMxSF0gT0RTStiWixOggWSqIKnwkliejNKZkFjR0Oj6jEAnZ9oJysm7gJI7eWDkgMKKtNFplNMCxAg2OYgIRILUsKEDfUHWgdeQ4n9N4BOoYSuM2ket/gAAAABJRU5ErkJggg==",
            name: "Based link",
            rarity: 2000,
            subtype: "",
            type: "background",
        },
        {
            _id: "64d317febf04b76cc857820e",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAXhJREFUWIXtVzFygzAQXClMCt9H1Hjc5B1p+UzKfIY230jFpOEj5yIzDimE5OMkM4ARyUyyDUZzvl32kLw2eHrssQLkCNxx8nkpLADg/dPf1WbWVRNyxyBHi3oEThMciA1mgDv2jZr+2rTpl/eIAmoDag/zbZTkU2s3QI7ApzPQ9MMI5Bdrc9vOgBxRTpC4kqNxn6HeaoLgBDnyRQueLBEkRsMdg9pDIjB1YMBIxFoI8qxAKAfibIa1tVtLIr6wAPh0TsZr1p4DW6GSaiLusX0KGZ6qOKki1GK8gKMFjqLw5VJGwOuDEnQZBEhCbdOW+PhKnPYv4ZtYeS7HDwCa68d3QXIS7obkJNxThDjerV7YBeKB/x247oLgQGkhiifdhiXdyPSOoTQkFmoPi7LdXJAjH0hC4pKhVIeGe2L2lIAch9VFADYnlz21uzapLLkdM70recMdg0BgbO8AgGz0T0ZQwv6A0T8oKSCExZLkWkQIv7/k5/gvC/gG03fEkYpL24UAAAAASUVORK5CYII=",
            name: "hxed",
            rarity: 2000,
            subtype: "",
            type: "background",
        },
        {
            _id: "64d3185abf04b76cc857820f",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAYNJREFUWIXFkjFLQmEUht8jH6REkkJJIiKIFCJYiGGBhBEXpMGhxaHFocWhwcXBxcHFtd/QXwiX5hpba22sucnrPS0evvmc5TvTszz3fS/fS8t+ihHyFhHxIiIGwADUbPUk18UJMH9lLPspAMB0lahYTutNVwnmNwTMesSznm+mZasnuTS9orAbmHSJJ13fTMtWT3JdvAGe3sJs4PGSgHGHeNzxzbRs9SSXHs4Db2DUIh61fDMtWz3JdesEeP4Is4H7MwKGTeJh0zfTstWTXLprBN7AoE48qPtmWrZ6kuviBHj5DLOB2xMCohpxVPPNtGz1JJeuqwi7gW4F3K34P9Gy1ZNcFyfA+zeCbOCiDKBdArdLvpmWrZ7k0ulR4A00CuBGwTfTstWTXLdOgK/fMBs4PgBQzYOred9My1ZPcqm8H3gDxSy4mPXNtGz1JNfFG+DnL8wGDncB5DLgXMY307LVk1za2wm8gbQDp51vpmWrJ7nkUuA4Adz2SbUsZ/0GbRsFu38vdCixvwapcwAAAABJRU5ErkJggg==",
            name: "BitChain",
            rarity: 2000,
            subtype: "",
            type: "background",
        },
        {
            _id: "64d335d90e6961cb2a903714",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAWdJREFUWIXtlt2tgzAMhU+r+9wyRPZigrBBnrxBmYC9MgSdIPehcWVISBxoxUuPhKhqx+eL8yOAn346qHC7hdMZjgy+fMlMXbcFIDjnVIlEpK6tBVCbt0JcW82NMcVkjscx1SXTACyKe++rEC1qAmBz7/05AAxxJH4YoKbW5fk4QGsH/gqxZAfHowXgvcs1Ma6TPZJb5zRYOwAAxvGRmGlFRJB1cn7NSyBn2hLbUjNAqRt7OrUFcIkt+4i22l8CWEDM8zMJynbnWs9jSubFgFAAAGsHdN09C7Fu/Tw/ITpY9FAB5MxrEhBFj10XERHBGJO890gDkGzIaZrQ933yltLMXpUQ9bUPktM/yWpLEPixdlDddOL6DeJpBgiIM+ZZd90dNQh59wOv41mDybUpWDtgHB+Ls09EcM6tz/hCnC9zAbxr8W/puwYIcgYliJxq5rIue8slCOtE7sTaMHcpyf9K5lwXcTn+AUR20b1t08v6AAAAAElFTkSuQmCC",
            name: "bot",
            rarity: 250,
            subtype: "",
            type: "brian",
        },
        {
            _id: "64d336b20e6961cb2a903715",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAiVJREFUWIXtVrtyGzEMXHiYMvoGuouK5FNcnL/T/hg35y7+Bqb1zKYg8TqdLel0nU0NZyQRJBZLYEHge3yPrz5kwx7ueebdtY5Zap5oIBowEZipdudA2ihnnRLgjwq8v0CmnxQAfP4HwUH66gGU5htKhby/yQCxheEPgRAEWSqJRsz0OZFYfq5g4axzcziR5HA2sTuYBoCxRjSbW0GQpdpGlqq/E5DIQBwGhMHmRjb80AGGaB3URPvOUjszAdCtjhMAEB4VAGNC739mBnHDNfjBACwaBcCwHpwaO+O6LEfOjM/KhMGGJCFi5gKCBCGP45/ncNQ8th7T8VeVpJYSBo2I92z0eslB2bD/dTibF1+F3/OyvkdGqxNLQL0aICfp7Nf4EYA1KRYcBZYD0oDHvpe/78FSu9UrgfJnbJBuM1wID5CHv8BRwFIpGwXRo9MoYomF7NdyxBySVZncoAPRONW/ZrsdOmfqTaC8AvaTZKJ5OaLFxPJIowZoOW70ZhGovkcJjs1IGTFQsTJgVXQzC2vafjpDQ9qjByAckKmPkYYktFzZyXkGEqiPmt8XW6oC04sLGtI1BUpMBJ/g8qvjSbou/JIhCvu8hnI5ajIp3YuIQ2VgJU82OKc5tQdZBBFbsGmA9xC3zWCWgWWnSfVODTOItan5EXNGAV+YmMsE86bDEEl8kgEnndCSNQjS4pW0CiQrmOp+eH4lGlfKMbTik4dKEKh01n/fvXr7n4pcpgAAAABJRU5ErkJggg==",
            name: "glitch",
            rarity: 250,
            subtype: "",
            type: "brian",
        },
        {
            _id: "64d337270e6961cb2a903717",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAdVJREFUWIXtVTFrwkAU/iydHKQgrRXJIAoBh2xS0dkugnRy7F/wB7i4+AP8Cx2dRMiis2JxcygEIg5SWltEJ9frYF64xEtyB4EW6gcHSd67933v3eU94IIL/jsSiv4s7rgqAliv3ZJy7PQH0rFlBUiTq4q4UiV//9hKCXD2RB6ZjAAPeS6bkRYhAyUBRJ7LZn5HAImIE8oC4safFsCchaE5BnC6hLT88NtoDx9HhOsg8nLxBgCwsA/ux7DzD7JxcRgEfUH5CDr9AYrarbItCMoCeu0W7M23sk1VQIIvPeA500j4fZ1YwrYcVoFQEU6vP3tWIY8SELqRnw8Rgyp0ICndgafGYyw+PGTGMSsXbzyB+ZLz4CsxNMeR5ZcVIBQRBllyQPEIVP4EWcgKOPsjgqCSvYwA6uPMnFlY2IfQKhC5ObM8e8MIglQyAKjVmwCA6WSE9e6IN2uDRlV3+7sfRF7SNeTTSdTqTXxuv7BazgM5RcOI1epNTCcj90PBqCCfTmK9O8KcWWhUdaEAETmBS8YzlPwVYORImdM7ZUKV6D4/eDZ2X16F5KvlHAWj4vrdZ+4ouQTgvQMecsqcrwShpGtIGXukjD0W9mmVdM21B5GTzeFhAPADzKjuJ4Dx1GMAAAAASUVORK5CYII=",
            name: "ape",
            rarity: 250,
            subtype: "",
            type: "brian",
        },
        {
            _id: "64d33a6b0e6961cb2a903718",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAZtJREFUWIXtVi1PxEAQfQUUjuQUZzCtIpzGENL+A3wTDP9j/8v9CgQNqUFT2cMRHJuicGQRsM3sZ2fvTpDQl1R0P+a9nZmdHWDGjP+OLHG92rfdFAHq/bnB0LXjwMnFFQA4Y4tVybbNFaA2a2GQUFLfWF4Lln2OAIPcR+gTxBVxwBAwupqCEvrIfXu2FjB0LdugJveJ2lpAikEgTfDsgaPInFN0frMaAGDfjMictuO9DaErMl69vBawCxAHuiBROz4+Vggo8loYp50an0IsBKNBHdOhax3Xa4QqZV6L4B4g7IGMbtwlCTdrEa2IsRBktgcoqLtt19seCJFHJwicV9AmDr0VnFcxmgMaNAcoQrFNCRlLgG3w+GtpzJ+enSO7vhwF7asQaWSLVek8ycvbO+NfPT7h5fV+/Oc2JeyGhOaB7QGNz8M3AGld0Z9vyZz3IFaWCTmbJ1QHlE1eFAWAn9j6EoyS67Uee86BfEkYbL2piKk1ESgQj9iumez7NUHf98CNQvVR4aFpDGIpJaSUU6acsKjUryrL5D3Wh2+6Q/gmB0ZYDQAAAABJRU5ErkJggg==",
            name: "2012 Brian",
            rarity: 250,
            subtype: "",
            type: "brian",
        },
        {
            _id: "64d33c980e6961cb2a90371c",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAaRJREFUWIXtlj1rwlAUhp8Uh9ahi/RjcQgOgoPgJmTpYNZAh/4EoT+p0L1LN8FJhy6Km+BQkCIOheIHLg7S7XZobogxubnXpkipL2TJuee8zz03JwkcddR/l2W4XmRd1wRAiGFXr2itoV1bF0Db3BTixNj8/EILwM9JPTIdgG3z9VIbQkdmANJ8vTwQgITIUOYAGevgADlFbOcJ9kfrOxgZS0VM1okdyaQ5FdPnBwDsu/sdM11ZtQbhOnF+xkcQ3qlJLEnGAKpu7NOpJADLb1kmSmq/CiAVItxuVetV5qCeApkY+z4Xw25gnNJ65QcpDUCpfafjxwBJLd8H6E/8D/yqDv5LltYBIa92f6z1prNqDdr98VbuPgACEI7r4bgeAJVykTQIaV4pFwFwXI9Sta6EiZsC4bgevU4ruFGq1rELeaarjQ9RjgWQ5nYhj+N6zOaLICY30uu0BKHjiZ6TkAv9xUHibL5gMhowXW14Hb9z+vK4lfh504w1n4wGsgsAXF9dys1ZUYAt87CpLCgBAOzmGQC5jycA3tq33/cL+cAwah4H8QXVLa1v81dHNQAAAABJRU5ErkJggg==",
            name: "brian",
            rarity: 9000,
            subtype: "",
            type: "brian",
        },
        {
            _id: "64cbec46f0b5d2b33465aacb",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAABpJREFUWIXtwQEBAAAAgiD/r25IQAEAAADvBhAgAAFHAaCIAAAAAElFTkSuQmCC",
            name: "NONE",
            rarity: 9000,
            type: "under",
        },
        {
            _id: "64cbedc6f0b5d2b33465aace",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAG1BMVEUAAAAYHDdUVnxeYIZoaJJ5e6T/Dg7xDg65Dg5VQ/s+AAAAAXRSTlMAQObYZgAAAGxJREFUKM/NzrERgDAIBVDIBMBdBmAEsoFeFsgKKRzAxtazcW1bwNbCX76Dfx9+FaQENQEbAjjDYZV5cWBt7d1faJvbDGD7oeBB5KIARRQiFIL79KUYh1uzCCJ5+oAYsQyUgDUBZnj/IMGXeQBrVQqHZbVfPQAAAABJRU5ErkJggg==",
            name: "All Your Base are Belong to Brian",
            rarity: 250,
            type: "under",
        },
        {
            _id: "64cc1c30d41a8fbeb23a837c",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAANbY1E9YMgAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAMUExURQIPIwc/lghPwP///xrXD+MAAAAEdFJOU////wBAKqn0AAAAT0lEQVR42uzT0QoAEAyF4X/z/u9sysVkkaIoLpb0bTs3SJPDhQA+2ANUT69AlAEAsRTtEJr2AqwQA0qrSL30wD17QZg/BnE0Xvw46yALMABzmgtROwpB5gAAAABJRU5ErkJggg==",
            name: " 80nd493",
            rarity: 250,
            type: "under",
        },
        {
            _id: "64cf12010400ee91e51a6097",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAaVJREFUWIXtVrFqwzAQfSmlf5ClgWbIUky3QCB7uxY6NUumDIX8QiBDIL9gyJCpi7u0dO9uMGQrneqhAU/+gy7qYMuVVUl3cpKpeWC4i+7eez4jRcARR7ghyudg/S1XcxL2AQCD6Yaqbdx/QrF0h2OURD6TEEnYR3c4JgtJA+vFTDfhMiJU8fViRho4JStKE5P5EklY5IPpxmhCjpwrzjagmviKHyshE3zEAcYn0E3so8bLwGS+rOLrm0uSUK1Re22gtpZwjZsDaguzzgEA6HQuqjjLtn+KXes7nQM6OTfXf7PBNgGRhH02CYUs21qnYJ3AvsQpLus5cHZ1j+/3pyo/v30GALRaxUtkr3esNckFvBh1rJ8gTyMAqJlogkIcaPdGRj3nLtjVBCUOMI9iSaRCN2Wq4YA8iOQU2r0RZCxzFfqa2ufSYf8X5GlUE1UFbeIckAY+3xa1XDfhmore2xQiXgUiTyORp5G8kDjjPI1EvAp2vU+aTeD3VmR8DiHONtFE3PumG68CAMDw4QO22IfX1wBQvp0UlCiFvTmbGKgZ2RPXP8YPXzXpRVEzCU4AAAAASUVORK5CYII=",
            name: "doge mask",
            rarity: 250,
            type: "under",
        },
        {
            _id: "64d06ca681d6f5f4029a2614",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAANRJREFUWIXtlcENwyAMRU3VBegSnYJdcmIoTt0lU3SJdAT3kDqiFpTvKhWKyrskwuD/YzAhGgz+HWecz3vntRhAxU25UQNWcTg/YmATX+YEqV5ChDVOUEaDuHUubOBXHMOApaTWNd0rcLZMzk+3/sIPMemiYjdAbfjNFoip+201dp1SUa+5BfoGUj0Ox2pAZ8Cr8voQ38bymJXmGXBEjom4JChjj4ZwrfzVQQ2rnRBT7rVe4tqID1EErH9dzIiOLXPi/LmLKAoTbaL5exe6ig8Gg8PxBMwxT7wtgZFdAAAAAElFTkSuQmCC",
            name: "split runner",
            rarity: 250,
            type: "under",
        },
        {
            _id: "64d30f20216597726cd76b17",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAABpJREFUWIXtwQEBAAAAgiD/r25IQAEAAADvBhAgAAFHAaCIAAAAAElFTkSuQmCC",
            name: "none",
            rarity: 9000,
            subtype: "",
            type: "eyes",
        },
        {
            _id: "64d33acc0e6961cb2a903719",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAQFJREFUWIXtlDFqw0AQRf8ELyKFVo0MukBcBNIJNYbcJKnUuvFB3LhNldzE4EaoM7iwLxBwGq0KEVRMmhhjsyPLmJDC8zrxRzNvpd0FFEVRFOWfISmwDy/gIAbsI181wa2Jvr/gth/eeCC910YZTFUwdgtvzsPno2cS6gBwG2UEXChgqoLd0zvCzzdvfjrwVGhPneSwq1duhK8tChw1Wc5gRyncpkQ4nnYP9NR2cddHQBRLctRJfk2LfgLheAq3KWFHKerlTBa6cPW9Bf4S8Rjep3OYqmDpXwOHjXiupo0yasqJN+86BeAgJtotxHuATUS/Q+SaICZTFWhERUVRlFvnB/fLWKltMKPvAAAAAElFTkSuQmCC",
            name: "Coindeck",
            rarity: 250,
            subtype: "",
            type: "eyes",
        },
        {
            _id: "64d33b010e6961cb2a90371a",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAARVJREFUWIXtlD1Ow0AQhd+OI2JllcJyFSHRpMkB0nCCXCLHyDFyC7gEJ6Cho6EgJUplUURGdrQ/qTbsBo+NQkEzn2TZ43njebveXUAQBEEQ/hnFZpY3yKYZ8tvc/6VB89Eoe7DAy7EzP+IKqSTYyvr6re7M64VOYk4HwFNJyjFJ1oCrnB/fjzH6/JaYwpzjy4bBUKwJcfvcejCzTZyBQL1uAADvD6/JXS90cnVpQm0fgwb0Y35+bu/S/2gKA1OY5F2siWuvNhCPYr/Z9Wpn2zn2mx1m2/mP2qsNxKMIH+YIzYPR38wAuw1plcNVzser/XKBhYU4pKGSlHvqno3Bc8AeLHsO0IQUALgvx2qyadZ7DgiCIAgn6T5zRAjS5/4AAAAASUVORK5CYII=",
            name: "hxedeck",
            rarity: 250,
            subtype: "",
            type: "eyes",
        },
        {
            _id: "64d2773339e12f247c8d8847",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAElBMVEVHcEwXGx8cTSk9s2pj4nj///9O+BITAAAAAXRSTlMAQObYZgAAAC9JREFUeAFjGAWMgoKCAmACKsBkLGisACZgAi4uLgpgAqZHNcQJSsCUKClAiGEGAFtHBZV2+zXTAAAAAElFTkSuQmCC",
            name: "relaxed",
            rarity: 250,
            type: "eyes",
        },
        {
            _id: "64d2774b39e12f247c8d8848",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAElBMVEVHcEzmuABXwf////8AAACFQwBrxE46AAAAAXRSTlMAQObYZgAAADRJREFUeAFjgIBRwCiIJiBkLICqQNlJEVXAxMkQVUBJGVUFg7CRKIYtAWj2kCHAiqmAVgAA/rQD/6xp5OgAAAAASUVORK5CYII=",
            name: "monocle",
            rarity: 250,
            type: "eyes",
        },
        {
            _id: "64d31792bf04b76cc857820c",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAJlJREFUWIVjYBgFQxkoKZj8V1Iw+U+JGYwkqifWMqLNJcUBpPqUKLOJdQCG5VxKX1H43+5xk2U+E5EOwAoeCuoz5N4Ip8QIohyAM+h7jmswlFjeIEsvDBATBVgNITIKCNpBtgNIAHjtYCHFJCUFE6LU3XtwhmgziU6ExFpOqlqiHECKgaTqGfA0MApGwSgYBaNgFIyCUTDgAABCgRuQDTQRngAAAABJRU5ErkJggg==",
            name: "blitcap",
            rarity: 2000,
            subtype: "",
            type: "over",
        },
        {
            _id: "64d317c1bf04b76cc857820d",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAHlBMVEVHcEwKCw8TFRgcICUlKjIwNT0HCAkdAP//AAAA/wApcIDTAAAAAXRSTlMAQObYZgAAAFRJREFUeNrtzzESwCAIRNGwiYve/8IBCsdibdJlxt8hj8LrZ9lsswfup2pBNADJEs303iNaEdOgDwe0MCQY3TGFAhFSKLBGU2Cd8i/zQcY4OJ0+9ALJsQGr1DftcAAAAABJRU5ErkJggg==",
            name: "blit beret",
            rarity: 2000,
            subtype: "",
            type: "over",
        },
        {
            _id: "64d1a7b37898f1fe0ec5fdf9",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAIxJREFUWIXtkkEOgCAMBFdDfIQnX6Jvl5d48hHGpJ4wEIm2oCd3Tg0p3WULQP5OU3BH3pxpaRYAEDfcD9wX0+xWKy5uSMQ9tmwd9T0lZTJwERvRnWehjo1o0RiQ8HKPLSsWmwq1NgVzAm+j+SiqXZZqPBmQ2fVJ7NZ62tdbHZWBGmoNAB+vgBBCCCGEHDFGMs1N9rIQAAAAAElFTkSuQmCC",
            name: "beanie red",
            rarity: 2000,
            type: "over",
        },
        {
            _id: "64d2766439e12f247c8d8843",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAJ9JREFUWIXtkkEKxCAMRb9D6CFceZJ6dnsSVx6iBNLNOJR20a8MzGLyQNRFfF8j4PyYMFFj3zzzNSovEmGS0OfzukhkAk5jRaKZJHtLbsMkWZHY9xQyIMeKBUFrv+mNoPXzElmbgWgH0y9K3snaYJKwYUfW9uigApgkSn4NEbQ+OqhPuGGnxDM1VIAVy3AAtoZqwbB93OE4juM4juP8MQeEkUHr6tMNcQAAAABJRU5ErkJggg==",
            name: "plaid cap red",
            rarity: 2000,
            type: "over",
        },
        {
            _id: "64d2767439e12f247c8d8844",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAIZJREFUWIXtlEsOgCAMRAfjeeD+x4AL1YVg/MQwVBMXzksILlreSI2A+Jjg6LE3z5yG5bFGaPv+OVIB3RgiDLZpr8tqzUCIeUAOZKwXHG+qQlUnAAUGYhzMvDh5oxxCdB1cgPYuPfk5ROg7uI8wkWJHDxcgOwKQPdwInuH51wghhBBCiB+xAOB1Jz2fJg/VAAAAAElFTkSuQmCC",
            name: "plaid cap 1337",
            rarity: 2000,
            type: "over",
        },
        {
            _id: "64d29002cc9d1932b749111b",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAHlBMVEUAAACRXjh6TSmqknbTvaPl1sW3pI8fHx+6ooc6LSZG/EWxAAAAAXRSTlMAQObYZgAAADhJREFUeJxjYBgFgxIwCgmgCigJCaEKCBorogoou4omoKpwDg9DEWgSDo1EEfDoMEVV4eLSjMIHAFukBlY4Zeq8AAAAAElFTkSuQmCC",
            name: "Mama Dolly The Sheep",
            rarity: 2000,
            subtype: "critter",
            type: "special",
        },
        {
            _id: "64d29003cc9d1932b749111c",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAGFBMVEUAAAD8Fw+jQBkwymEbhT0PUCRw/8EiqU1dW8gOAAAAAXRSTlMAQObYZgAAADlJREFUeJxjYBgFgwIwMqLxmZTQRJSdFVAFXEIcUAVYQ9EMDQsLQOGzh4aGowiwmIaaoAo4G7sg8wFXvQVlXpLBagAAAABJRU5ErkJggg==",
            name: "Snazz-Trap",
            rarity: 2000,
            subtype: "critter",
            type: "special",
        },
        {
            _id: "64d29005cc9d1932b749111d",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAATklEQVR4nO3SMRIAEAxE0Y37XzQz7kCDwWiF4r/GqHYTJAAAAACQlN3LSUR2mi9mtpzhBfrQ8/DXN7Gvv2UO2f1ugePjR4V333zCF54XqHineVn9ytp9AAAAAElFTkSuQmCC",
            name: "Ghost",
            rarity: 2000,
            subtype: "critter",
            type: "special",
        },
        {
            _id: "64d29006cc9d1932b749111e",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAElBMVEUAAABpFA6kQgDViTaHNwByLgAx2iSrAAAAAXRSTlMAQObYZgAAAC5JREFUeJxjYBgFgw4ICKDyGQUFUQWUlBRRlQgpKhJQwWyEqoIl2MURvwqQgAAAzLsDgEtd87YAAAAASUVORK5CYII=",
            name: "TinyDino Fire",
            rarity: 2000,
            subtype: "critter",
            type: "special",
        },
        {
            _id: "64d29000cc9d1932b7491119",
            img_data:
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAHlBMVEUAAADh4UznI83nWtXzkubNHLVfXxHt7YCgE42LDnvDtSqYAAAAAXRSTlMAQObYZgAAADVJREFUeJxjYBgFgxIIgACygJKSsbMCsgBrWJEbqp4gI2c0AY0GVIHQADRrQieg8WfORFECAM4AB2AO+eU3AAAAAElFTkSuQmCC",
            name: "Rakket",
            rarity: 2000,
            subtype: "critter",
            type: "special",
        },
    ];
};

exports.prepLayer = (assets_path, traits, layer) => {
    let names = [];
    let images = [];
    let rarities = [];

    let payload = traits.filter((t) => t.type === layer);

    // SORT BY RARITY
    payload = payload.sort(function (a, b) {
        return a.rarity - b.rarity;
    });

    for (let i = 0; i < payload.length; i++) {
        const filename = `${payload[i].name}.png`;
        let filedata = payload[i].img_data.split("data:image/png;base64,")[1];
        if (filedata === undefined) {
            filedata = payload[i].img_data.split("data:image/gif;base64,")[1];
        }

        // SAVE THE IMAGE LOCALLY
        const dirpath = `${assets_path}/${layer}`;
        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath);
        }
        const filepath = `${dirpath}/${filename}`;
        fs.writeFileSync(filepath, filedata, {
            encoding: "base64",
        });

        // READ IT AGAIN AS BYTES
        const imageBytes = fs.readFileSync(filepath, {});
        names.push(`${payload[i].name}`.toLowerCase().trim());
        images.push(imageBytes);
        rarities.push(payload[i].rarity);
    }

    let results = { traits: [], rarities: rarities };
    for (let i = 0; i < names.length; i++) {
        results.traits.push({
            name: names[i],
            image: images[i],
        });
    }
    return results;
};
