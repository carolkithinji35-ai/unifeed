import { Link } from "react-router-dom";
import { useState } from "react";

// TweetCard component - displays one user as if they posted a tweet
function TweetCard({ user }) {
    // State for interactions
    const [liked, setLiked] = useState(false);
    const [reposted, setReposted] = useState(false);
    const [likes, setLikes] = useState(245);
    const [reposts, setReposts] = useState(89);

    // Simulated tweet content based on user data
    // Using user's first name makes it feel more unique
    const tweetOptions = [
        `Can't believe it's already Monday, still studying urrrgh!`,
        `Coffee run with ${user.name.first} ☕️`,
        `The library is my second home at this point 🏛️`,
        `Shoutout to ${user.name.first} for the study session!`,
        `Campus food hits different after a long day 🍕`,
        `Anyone else excited for the game this weekend? 🏈`,
        `Just turned in my final paper! Freedom! 🎉`,
        `Why is parking on campus impossible? 😤`,
        `Late night study vibes with ${user.name.first} `,
    ];

    // Pick a tweet based on the user's name so it's different per person
    const tweetText =
        tweetOptions[user.name.first.length % tweetOptions.length];

    // Time ago (static for now)
    const timeAgo = "2h";

    return (
        <div className="border-b border-x-lightgray p-4 hover:bg-gray-50 transition-colors">
            <div className="flex space-x-3">
                {/* Avatar image - clicking it goes to the user's profile */}
                <Link to={`/profile/${user.login.uuid}`}>
                    <img
                        src={user.picture.thumbnail}
                        alt={user.name.first}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                </Link>

                {/* Main tweet content */}
                <div className="flex-1 min-w-0">
                    {/* User info row */}
                    <div className="flex items-center space-x-1">
                        <Link
                            to={`/profile/${user.login.uuid}`}
                            className="font-bold hover:underline"
                        >
                            {user.name.first} {user.name.last}
                        </Link>
                        <span className="text-x-gray">
                            @{user.login.username}
                        </span>
                        <span className="text-x-gray">·</span>
                        <span className="text-x-gray">{timeAgo}</span>
                    </div>

                    {/* The actual tweet text */}
                    <p className="mt-1 text-lg">{tweetText}</p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between mt-3 max-w-md">
                        {/* Comment button */}
                        <button className="flex items-center space-x-1 text-x-gray hover:text-blue-500">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <span>12</span>
                        </button>

                        {/* Repost button */}
                        <button
                            onClick={() => {
                                setReposted(!reposted);
                                setReposts(
                                    reposted ? reposts - 1 : reposts + 1,
                                );
                            }}
                            className={`flex items-center space-x-1 ${reposted ? "text-green-500" : "text-x-gray hover:text-green-500"}`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                                />
                            </svg>
                            <span>{reposts}</span>
                        </button>

                        {/* Like button */}
                        <button
                            onClick={() => {
                                const newLiked = !liked;
                                setLiked(newLiked);
                                setLikes(newLiked ? likes + 1 : likes - 1);
                            }}
                            className={`flex items-center space-x-1 ${liked ? "text-red-500" : "text-x-gray hover:text-red-500"}`}
                        >
                            <svg
                                className="w-5 h-5"
                                fill={liked ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span>{likes}</span>
                        </button>

                        {/* Share button */}
                        <button className="text-x-gray hover:text-blue-500">
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TweetCard;
