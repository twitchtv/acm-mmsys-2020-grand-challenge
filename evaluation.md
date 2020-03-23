# Submission and Evaluation

We require code to be submitted for verification. Source code may be zipped and emailed to 2020-lll-challenge@acmmmsys.org. Following ACM’s rules, the review and evaluation process is not a public disclosure:

> The official publication date is the date the proceedings are made available in the ACM Digital Library. This date may be up to two weeks prior to the first day of the conference. The official publication date affects the deadline for any patent filings related to the published work. As a reminder, the review process is not a public disclosure and the reviewers are bound by the confidentiality agreement of ACM. See the ACM policies for details.

Please see https://2020.acmmmsys.org/calls.php for the full intellectual property text.

Evaluation will be done by a panel of judges at Twitch using both objective and subjective measures. Please read on for more info.

## Transparency
In addition to an objective QoE score, we will also be considering subjective criteria (see below). We feel that it would be impossible to choose a winner based on a single objective score. We will share as much as possible on how we evaluate solutions, and be transparent with our feedback.

To prevent bias, the judges will not be aware of the identities of the team behind each submission.

## Testing

The player will be run with the "Normal" ffmpeg profile, against each of the five network profiles defined in [normal-network-patterns.js](normal-network-patterns.js). During each run the test framework will sample the player stats for each chunk - in this case, the chunk size is equal to the frame size, approximately 33ms. These stats will be computed into an "NQoE" score as defined below. Each profile will be executed three times to form an Average NQoE, which will be the final score for that profile.

We reserve the right to test submissions any way we see fit, including with media not listed above, and under different network conditions.

### NQoE

NQoE is an aggregate measure that considers five essential metrics: bitrate selected, bitrate switches, rebuffering time, live latency, and playback speed.

## Evaluation

Each of the five NQoE averages will be averaged into an NQoE "superscore", which is the final score for the algorithm. However, the highest superscore may not determine the winner - the performance of the algorithm across all profiles, in addition to other criteria, will be taken into account. Please note, however, that the NQoE superscore carries significant weight.

## Subjective Criteria
- Playback rate
    - Is the rate being changed in a way which negatively impacts the viewing experience?
	    - Does the audio ever sound distorted? If so, for how long does the distortion last, and at what intensity?
    - Is the rate being changed in order to avoid stalls and spoof NQoE?
- Network utilization
    - Does the algorithm use network resources in a way which does not scale?
	    - For example, is the player making network requests at a rate or using bandwidth which would overwhelm a server serving            thousands of concurrent users?
- Network fairness
    - Does the algorithm use network resources in a way which does not scale?
- Resource utilization (CPU and memory)
    - Does the algorithm use devices resources in a way which affects performance of the player, or rest of the webpage? Does the amount of resources necessitate a powerful computer?
- Feasibility of production-quality implementation
    - How robust is the solution? Does it handle edge cases well?
	    - For example, if the connection quality is variable, does the algorithm still produce accurate estimates?

Please note that this list is not exhaustive. We will publish our full rubrick when results are released.

