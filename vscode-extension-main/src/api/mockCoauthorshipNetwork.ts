/**
 * EVERYTHING HERE IS UNUSED
 */

export class ContributorObject {
    id: number;
    email: string; 
    knowledgeScore: number;

    constructor(id: number,  email: string, knowledgeScore: number
        ){
            this.id = id;
            this.email = email;
            this.knowledgeScore = knowledgeScore;
        }
}

export class Link {
    source: number;
    target: number;
    strength: number;
    constructor(source: number, target: number, strength: number)
    {
        this.source = source;
        this.target = target;
        this.strength = strength;
    }
}

export async function mockCoauthorshipNetworkGETRequest(contributors: number){
    let contributorList: ContributorObject[] = [];
    for (let i = 0; i < contributors; i++)
    {
        contributorList.push(new ContributorObject(i, i.toString().concat("@gmail.com"), i+5));
    }
    let links: Link[] = [];
    for (let i = 0; i < contributors; i++)
    {
        if (i % 2 === 0 && i > 1)
        {
            links.push(new Link(i, i-1, i % 5));
        }
    }
    let returnObject = {nodes: contributorList, links: links};
    return returnObject;
}
/*export var mockKnowledgeGraphResponse = {
    "totalLinesInCodebase": 2774+1+7+256,
    "totalFilesInCodebase": 47,
    "contributorList": [
        {
            "id": 0,
            "email": "pfyffe@iu.edu",
            "knowledgeScore": 2774,
            "filesKnown": [
                "DoctorSearchRequest.java",
                "PermissionDeniedExceptionResponse.java",
                "AppointmentService.java",
                "InsurancePackageRepository.java",
                "MessageRepository.java",
                "InvalidLoginExceptionResponse.java",
                "InsurancePackageSearchRequest.java",
                "PatientManagerSpringApplicationTests.java",
                "UserNotFoundException.java",
                "MavenWrapperDownloader.java",
                "InvalidLoginException.java",
                "UserController.java",
                "Doctor.java",
                "InsurancePackage.java",
                "ControllerUtility.java",
                "UserNotFoundExceptionResponse.java",
                "PatientManagerSpringApplication.java",
                "JwtLoginSuccessResponse.java",
                "InsurancePackageAlreadyHeldExceptionResponse.java",
                "Message.java",
                "UserService.java",
                "ErrorMapValidationService.java",
                "ConversationService.java",
                "SecurityConstants.java",
                "SecurityConfig.java",
                "InsurancePackageService.java",
                "ConversationController.java",
                "CustomUserDetailsService.java",
                "AppointmentController.java",
                "UserRepository.java",
                "JwtAuthenticationEntryPoint.java",
                "ConversationRepository.java",
                "Appointment.java",
                "EmailTakenExceptionResponse.java",
                "LoginRequest.java",
                "EmailTakenException.java",
                "User.java",
                "AppointmentRepository.java",
                "PermissionDeniedException.java",
                "InsurancePackageController.java",
                "CustomResponseEntityExceptionHandler.java",
                "Insurer.java",
                "JwtAuthenticationFilter.java",
                "Conversation.java",
                "JwtTokenProvider.java",
                "InsurancePackageAlreadyHeldException.java",
                "Patient.java"
            ]
        },
        {
            "id": 1,
            "email": "fyffep",
            "knowledgeScore": 1,
            "filesKnown": []
        },
        {
            "id": 2,
            "email": "stjpace@iu.edu",
            "knowledgeScore": 7,
            "filesKnown": [
                "Doctor.java",
                "Appointment.java"
            ]
        },
        {
            "id": 3,
            "email": "kianhan97@gmail.com",
            "knowledgeScore": 256,
            "filesKnown": [
                "InsurancePackageController.java",
                "Insurer.java",
                "InsurancePackageService.java",
                "InsurancePackageRepository.java",
                "InsurancePackageSearchRequest.java",
                "InsurancePackage.java",
                "Patient.java"
            ]
        }
    ],
    "links": [
        {
            "source": 0,
            "target": 3,
            "strength": 13
        },
        {
            "source": 0,
            "target": 2,
            "strength": 3
        }
    ]
};*/
