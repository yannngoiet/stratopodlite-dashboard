import { Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import SimplebarClient from '@/components/client-wrapper/SimplebarClient';
import { TbArchive, TbBrain, TbFolder, TbFolderPlus, TbGridPattern, TbMessageCircle, TbSearch, TbVideo } from 'react-icons/tb';
import clsx from 'clsx';
const sideBarItems = [{
  label: 'Start Chat',
  icon: TbMessageCircle
}, {
  label: 'Find Threads',
  icon: TbSearch
}, {
  label: 'Saved Sessions',
  icon: TbArchive
}, {
  label: 'AI Tools',
  icon: TbBrain
}, {
  label: 'AI Vision',
  icon: TbVideo
}, {
  label: 'Explore Models',
  icon: TbGridPattern
}];
const workspaceItems = [{
  label: 'New Workspace',
  icon: TbFolderPlus
}, {
  label: 'Marketing',
  icon: TbFolder
}, {
  label: 'Design Team',
  icon: TbFolder
}, {
  label: 'DevOps',
  icon: TbFolder
}, {
  label: 'Legal',
  icon: TbFolder
}, {
  label: 'Freelancers',
  icon: TbFolder
}];
const resentConversations = [{
  label: 'Website Redesign Brief'
}, {
  label: 'Sprint Planning Q2'
}, {
  label: 'Client Onboarding Script'
}, {
  label: 'Legal Agreement Review'
}, {
  label: 'Product Launch Sequence'
}, {
  label: 'Budget Automation Draft'
}];
const SideBar = () => {
  return <Card className="rounded-0 mb-0">
      <SimplebarClient className="card-body p-0 sidebar-offcanvas" style={{
      height: 'calc(100vh - 170px)'
    }}>
        <div className="chat-sidebar p-3">
          <div className="mb-4">
            <ListGroup variant="flush" className="list-custom">
              {sideBarItems.map((item, idx) => <ListGroupItem action key={idx} className={clsx('d-flex align-items-center gap-2', idx === 0 && 'active')}>
                  {item.icon && <item.icon className="fs-md" />}
                  {item.label}
                </ListGroupItem>)}
            </ListGroup>
          </div>

          <div className="mb-3">
            <h6 className="text-muted text-uppercase fs-xs mb-2">Workspaces</h6>
            <ListGroup variant="flush" className="list-custom">
              {workspaceItems.map((item, idx) => <ListGroupItem action href="#" key={idx} className="d-flex align-items-center gap-2">
                  {item.icon && <item.icon className="fs-md" />}
                  {item.label}
                </ListGroupItem>)}
            </ListGroup>
          </div>

          <div>
            <h6 className="text-muted text-uppercase fs-xs mb-2">Recent Conversations</h6>
            <ListGroup variant="flush" className="list-custom">
              {resentConversations.map((item, idx) => <ListGroupItem action className="text-body py-1" key={idx}>
                  {item.label}
                </ListGroupItem>)}
            </ListGroup>
          </div>
        </div>
      </SimplebarClient>
    </Card>;
};
export default SideBar;